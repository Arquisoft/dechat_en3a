import { Injectable } from '@angular/core';
import { SolidSession } from '../models/solid-session.model';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/chat-message.model';
import * as fileClient from 'solid-file-client';
declare let solid: any;
declare let $rdf: any;
import * as $rdf from 'rdflib'

// TODO: Remove any UI interaction from this service
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NamedNode } from 'rdflib';

const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const MEE = $rdf.Namespace('http://www.w3.org/ns/pim/meeting#');
const RDFSYN = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const DCEL = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const TERMS = $rdf.Namespace('http://purl.org/dc/terms/');
const SIOC = $rdf.Namespace('http://rdfs.org/sioc/ns#');
const FLOW = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');

/**
 * A service layer for RDF data manipulation using rdflib.js
 * @see https://solid.inrupt.com/docs/manipulating-ld-with-rdflib
 */
@Injectable({
  providedIn: 'root',
})
export class RdfService {

  session: SolidSession;
  store = $rdf.graph();

  /**
   * A helper object that connects to the web, loads data, and saves it back. More powerful than using a simple
   * store object.
   * When you have a fetcher, then you also can ask the query engine to go fetch new linked data automatically
   * as your query makes its way across the web.
   * @see http://linkeddata.github.io/rdflib.js/doc/Fetcher.html
   */
  fetcher = $rdf.Fetcher;

  /**
   * The UpdateManager allows you to send small changes to the server to “patch” the data as your user changes data in
   * real time. It also allows you to subscribe to changes other people make to the same file, keeping track of
   * upstream and downstream changes, and signaling any conflict between them.
   * @see http://linkeddata.github.io/rdflib.js/doc/UpdateManager.html
   */
  updateManager = $rdf.UpdateManager;

  constructor (private toastr: ToastrService) {
    const fetcherOptions = {};
    this.fetcher = new $rdf.Fetcher(this.store, fetcherOptions);
    this.updateManager = new $rdf.UpdateManager(this.store);
    this.getSession();
  }

  /**
   * Fetches the session from Solid, and store results in localStorage
   */
  getSession = async() => {
    this.session = await solid.auth.currentSession(localStorage);
  }

  /**
   * Gets a node that matches the specified pattern using the VCARD onthology
   *
   * any() can take a subject and a predicate to find Any one person identified by the webId
   * that matches against the node/predicated
   *
   * @param {string} node VCARD predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   * @see https://github.com/solid/solid-tutorial-rdflib.js
   */
  getValueFromVcard = (node: string, webId?: string): string | any => {
    return this.getValueFromNamespace(node, VCARD, webId);
  };

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node FOAF predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   */
  getValueFromFoaf = (node: string, webId?: string) => {
    return this.getValueFromNamespace(node, FOAF, webId);
  };
 
  transformDataForm = (form: NgForm, me: any, doc: any) => {
    const insertions = [];
    const deletions = [];
    const fields = Object.keys(form.value);
    const oldProfileData = JSON.parse(localStorage.getItem('oldProfileData')) || {};

    // We need to split out into three code paths here:
    // 1. There is an old value and a new value. This is the update path
    // 2. There is no old value and a new value. This is the insert path
    // 3. There is an old value and no new value. Ths is the delete path
    // These are separate codepaths because the system needs to know what to do in each case
    fields.map(field => {

      let predicate = VCARD(this.getFieldName(field));
      let subject = this.getUriForField(field, me);
      let why = doc;

      let fieldValue = this.getFieldValue(form, field);
      let oldFieldValue = this.getOldFieldValue(field, oldProfileData);

      // if there's no existing home phone number or email address, we need to add one, then add the link for hasTelephone or hasEmail
      if(!oldFieldValue && fieldValue && (field === 'phone' || field==='email')) {
        this.addNewLinkedField(field, insertions, predicate, fieldValue, why, me);
      } else {

        //Add a value to be updated
        if (oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }

        //Add a value to be deleted
        else if (oldProfileData[field] && !form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
        }

        //Add a value to be inserted
        else if (!oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }
      }
    });

    return {
      insertions: insertions,
      deletions: deletions
    };
  };

  private addNewLinkedField(field, insertions, predicate, fieldValue, why, me: any) {
    //Generate a new ID. This id can be anything but needs to be unique.
    let newId = field + ':' + Date.now();

    //Get a new subject, using the new ID
    let newSubject = $rdf.sym(this.session.webId.split('#')[0] + '#' + newId);

    //Set new predicate, based on email or phone fields
    let newPredicate = field === 'phone' ? $rdf.sym(VCARD('hasTelephone')) : $rdf.sym(VCARD('hasEmail'));

    //Add new phone or email to the pod
    insertions.push($rdf.st(newSubject, predicate, fieldValue, why));

    //Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    //Todo: Make this dynamic
    let type = field === 'phone' ? $rdf.literal('Home') : $rdf.literal('Personal');
    insertions.push($rdf.st(newSubject, VCARD('type'), type, why));

    //Add a link in #me to the email/phone number (by id)
    insertions.push($rdf.st(me, newPredicate, newSubject, why));
  }

  private getUriForField(field, me): string {
    let uriString: string;
    let uri: any;

    switch(field) {
      case 'phone':
        uriString = this.getValueFromVcard('hasTelephone');
        if(uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      case 'email':
        uriString = this.getValueFromVcard('hasEmail');
        if(uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      default:
        uri = me;
        break;
    }

    return uri;
  }

  /**
   * Extracts the value of a field of a NgForm and converts it to a $rdf.NamedNode
   * @param {NgForm} form
   * @param {string} field The name of the field that is going to be extracted from the form
   * @return {RdfNamedNode}
   */
  private getFieldValue(form: NgForm, field: string): any {
    let fieldValue: any;

    if(!form.value[field]) {
      return;
    }

    switch(field) {
      case 'phone':
        fieldValue = $rdf.sym('tel:+'+form.value[field]);
        break;
      case 'email':
        fieldValue = $rdf.sym('mailto:'+form.value[field]);
        break;
      default:
        fieldValue = form.value[field];
        break;
    }

    return fieldValue;
  }

  private getOldFieldValue(field, oldProfile): any {
    let oldValue: any;

    if(!oldProfile || !oldProfile[field]) {
      return;
    }

    switch(field) {
      case 'phone':
        oldValue = $rdf.sym('tel:+'+oldProfile[field]);
        break;
      case 'email':
        oldValue = $rdf.sym('mailto:'+oldProfile[field]);
        break;
      default:
        oldValue = oldProfile[field];
        break;
    }

    return oldValue;
  }

  private getFieldName(field): string {
    switch (field) {
      case 'company':
        return 'organization-name';
      case 'phone':
      case 'email':
        return 'value';
      default:
        return field;
    }
  }

  updateProfile = async (form: NgForm) => {
    const me = $rdf.sym(this.session.webId);
    const doc = $rdf.NamedNode.fromValue(this.session.webId.split('#')[0]);
    const data = this.transformDataForm(form, me, doc);

    //Update existing values
    if(data.insertions.length > 0 || data.deletions.length > 0) {
      this.updateManager.update(data.deletions, data.insertions, (response, success, message) => {
        if(success) {
          this.toastr.success('Your Solid profile has been successfully updated', 'Success!');
          form.form.markAsPristine();
          form.form.markAsTouched();
        } else {
          this.toastr.error('Message: '+ message, 'An error has occurred');
        }
      });
    }
  };

  getAddress = () => {
    const linkedUri = this.getValueFromVcard('hasAddress');

    if (linkedUri) {
      return {
        locality: this.getValueFromVcard('locality', linkedUri),
        country_name: this.getValueFromVcard('country-name', linkedUri),
        region: this.getValueFromVcard('region', linkedUri),
        street: this.getValueFromVcard('street-address', linkedUri),
      };
    }

    return {};
  };

  //Function to get email. This returns only the first email, which is temporary
  getEmail = () => {
    const linkedUri = this.getValueFromVcard('hasEmail');

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('mailto:')[1];
    }

    return '';
  }

  //Function to get phone number. This returns only the first phone number, which is temporary. It also ignores the type.
  getPhone = () => {
    const linkedUri = this.getValueFromVcard('hasTelephone');

    if(linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('tel:+')[1];
    }
  };

  getProfile = async () => {

    if (!this.session) {
      await this.getSession();
    }

    try {
      await this.fetcher.load(this.session.webId);

      return {
        fn : this.getValueFromVcard('fn'),
        company : this.getValueFromVcard('organization-name'),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role'),
        image: this.getValueFromVcard('hasPhoto'),
        address: this.getAddress(),
        email: this.getEmail(),
      };
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  };

  /**
   * Gets any resource that matches the node, using the provided Namespace
   * @param {string} node The name of the predicate to be applied using the provided Namespace 
   * @param {$rdf.namespace} namespace The RDF Namespace
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me) 
   */
  private getValueFromNamespace(node: string, namespace: any, webId?: string): string | any {
    const store = this.store.any($rdf.sym(webId || this.session.webId), namespace(node));
    if (store) {
      return store.value;
    }
    return '';
  }

  async getfriendsList(): Promise<Array<NamedNode>> {
    const webId = this.session.webId;
    return this.getDataAsArray(webId, 'knows', FOAF);
  }

  private async getDataAsArray(webId: string | String, field: string, namespace: any): Promise<Array<NamedNode>> {
    try {
        await this.fetcher.load(this.store.sym(webId).doc());
        return this.store.each(this.store.sym(webId), namespace(field)); 
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  }

  async getStringProfile(field: string): Promise<string> {
    return this.getFieldAsString(this.session.webId, field, VCARD);
  }

  private async getFieldAsString(webId: string, field: string, namespace: any): Promise<string> {
    try {
      await this.fetcher.load(this.store.sym(webId).doc());
      return this.store.any(this.store.sym(webId), namespace(field));
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  }

  /**
   * This method is used to get the channel with the partner.
   * @param userWebId 
   * @param partnerWebId 
   */
  async getChannel(userWebId: string, partnerWebId: string): Promise<string>{
    const me = this.store.sym(userWebId.replace('#me', ''));
    const document = me.doc();
    await this.fetcher.load(document);
    const partner = this.store.sym(partnerWebId);
    const match = await this.store.match(null, MEE('Chat'), partner, document);
    return match[0].subject.value;
  }

  /**
   * We use this method to create the new chat with the partner.
   * @param ownWebId 
   * @param partnerWebId 
   * @param chatFolder 
   */
  async createNewChat(ownWebId: string, partnerWebId: string, chatFolder: string){
    const currentDate = new Date();
    const thisUriSym = this.store.sym(chatFolder + '#this');
    const ownUriSym = this.store.sym(ownWebId);
    const partnerUiSym = this.store.sym(partnerWebId);

    const ins = [];

    const indexFile = this.store.sym(chatFolder);
    const myCardFile = this.store.sym(ownWebId.replace('#me', ''));
    const chatFolderFile = this.store.sym(chatFolder.replace('/chat.ttl', ''));
    this.fetcher.load(myCardFile.doc());

    ins.push($rdf.st(thisUriSym, RDFSYN('type'), MEE('Chat'), indexFile.doc()));
    ins.push($rdf.st(thisUriSym, DCEL('author'), ownUriSym, indexFile.doc()));
    ins.push($rdf.st(thisUriSym, DCEL('created'), currentDate, indexFile.doc()));
    ins.push($rdf.st(thisUriSym, DCEL('title'), 'Chat', indexFile.doc()));
   
    await this.updateManager.put(indexFile.doc(), ins, 'text/turtle', (uri, ok, message, response) => {});

    const cardNote = $rdf.st(chatFolderFile, MEE('Chat'), partnerUiSym, myCardFile.doc());
  }
  
  /**
   * This method is used to create the structure
   * @param uri 
   */
  async createStructure(uri: string) {
    const splitted = uri.split('/');
    console.log(splitted);
    for (let i = 3; i > 0; i--) {
      const newUri = splitted.slice(0, splitted.length - i).join('/');
      console.log(newUri);
      await fileClient.createFolder(newUri);
    }
    await this.createChatFile(uri);
  }
  
  /**
   * This method is used to create the file with the message of the chat
   * @param uri 
   */
  async createChatFile(uri: string) {
    const chatFile = this.store.sym(uri);
    const folder = uri.replace('/chat.ttl', '');
    const chatFolder = this.store.sym(folder);
    await this.fetcher.load(chatFolder.doc());
    const matches = await this.store.match(chatFolder, LDP('contains'), null, chatFolder.doc());

    if (matches.length === 0) {
      await this.updateManager.put(chatFile.doc(), '', 'text/turtle', function (o, s, c) { });
    }

  }


  /**
   * This method is used to add a message to the pod.
   * @param chatFileUri 
   * @param message 
   * @param ownUri 
   * @param partnerFile 
   */
  async addMessage(chatFileUri: string, message: ChatMessage, ownUri: string, partnerFile: string) {
    let time = message.timeSent.getUTCFullYear() + ('0' + (message.timeSent.getUTCMonth() + 1)).slice(-2) 
    + ('0' + message.timeSent.getUTCDate()).slice(-2) + ('0' + message.timeSent.getHours()).slice(-2) 
    + ('0' + message.timeSent.getMinutes()).slice(-2)
    const msgUri = chatFileUri + '#Msg' + time;
    const indexUri = chatFileUri.split('/').slice(0, 6).join('/') + '#this';
    const msgUriSym = this.store.sym(msgUri);
    const indexUriSym = this.store.sym(indexUri);
    
    const ins = [];

    const cFile = this.store.sym(chatFileUri);
    this.fetcher.load(cFile.doc());
    ins.push($rdf.st(msgUriSym, TERMS('created'), message.timeSent, cFile.doc()));
    ins.push($rdf.st(msgUriSym, SIOC('content'), message.message, cFile.doc()));
    ins.push($rdf.st(msgUriSym, FOAF('maker'), this.store.sym(ownUri), cFile.doc()));

    ins.push($rdf.st(indexUriSym, FLOW('message'), msgUriSym, cFile.doc()));

    this.updateManager.update([], ins, (uri, ok, msg, response) => {});

    //Send to the partner
    const msgPartnerUri = partnerFile + '#Msg' + time;
    const indexParnerUri = partnerFile.split('/').slice(0, 6).join('/') + '#this';
    const msgPartnerUriSym = this.store.sym(msgPartnerUri);
    const indexPartnerUriSym = this.store.sym(indexParnerUri);

    const ins2 = [];

    const pFile = this.store.sym(partnerFile);
    this.fetcher.load(pFile.doc());
    ins2.push($rdf.st(msgPartnerUriSym, TERMS('created'), message.timeSent, pFile.doc()));
    ins2.push($rdf.st(msgPartnerUriSym, SIOC('content'), message.message, pFile.doc()));
    ins2.push($rdf.st(msgPartnerUriSym, FOAF('maker'), this.store.sym(ownUri), pFile.doc()));

    ins2.push($rdf.st(indexPartnerUriSym, FLOW('message'), msgPartnerUriSym, pFile.doc()));
  
    this.updateManager.update([], ins2, (uri, ok, msg, response) => {});
  
  }

  async getMessageUrisForFile(chatFileUri: string, chatUri: string): Promise<Array<NamedNode>> {
    const d = this.store.sym(chatFileUri);
    await this.fetcher.load(d.doc());
    const indexUri = chatUri + '/index.ttl#this';
    const indexd = this.store.sym(indexUri);
    const messagesIdsList = (await this.store.match(indexd, FLOW('message'), null, d.doc())).map(e => e.object);
    return messagesIdsList;
  }

}
