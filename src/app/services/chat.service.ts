import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';
import * as fileClient from 'solid-file-client';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable()
export class ChatService{

  providers: [ RdfService ];
  chatMessages: ChatMessage[] = new Array<ChatMessage>();


  thisUser: BehaviorSubject<User>;
  ownUser: User;
  partnerUser: User;
  currentUserWebId: string;
  currentChannel: string;
  currentPartnerChannel: string;
  currentChatFile: string;

  friendsList: Array<User> = new Array<User>();

  constructor ( private rdf : RdfService, private toastr: ToastrService){
      this.rdf.getSession();
      this.thisUser = new BehaviorSubject<User>(null);
      this.loadOwnUser();
      this.loadUserData().then(response => { this.loadFriends(); });
  }
/**
 * Loads the user that logs in the application with the webId
 * 
 */
  async loadOwnUser() {
    await this.rdf.getSession();
    const photo: string = '../assets/images/profile.png';
    this.ownUser = new User(this.rdf.session.webId, this.getUsername(this.rdf.session.webId), photo);
  }

  /**
   * This method gets the username of the logged user.
   * @param webId 
   */
  private getUsername(webId: String) {
    let username = '';
    username = webId.replace('https://', '');
    return username.split('.')[0];        
  }

/**
 * This method loads the information of the logged user.
 */
  async loadUserData() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    const webId = this.rdf.session.webId;
    let user : User = new User(webId, '', '');
    await this.rdf.getStringProfile('name').then(response => {
      user.username = response;
    });
    await this.rdf.getStringProfile('photo').then(response => {
      user.profilePicture = response;
    });
    this.currentUserWebId = webId.split('/')[2].split('.')[0];
    this.thisUser.next(user);
  }

  /**
   * This method loads the friends of the logged user.
   */
  async loadFriends() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    (await this.rdf.getfriendsList()).forEach(async element => {
      await this.rdf.fetcher.load(element.value);
      const photo: string = this.rdf.getValueFromVcard('hasPhoto', element.value) || '../assets/images/profile.png';
      this.friendsList.push(new User(element.value, this.rdf.getValueFromVcard('fn', element.value), photo));
      this.friendsList.sort(this.sortUserByName);
    });
  }

  /**
   * This method sorts user by their names.
   * @param u1 
   * @param u2 
   */
  private sortUserByName(u1: User, u2: User) {
    return u1.username.localeCompare(u2.username);
  }

  /**
   * This method load the partner with its webId.
   * @param username T
   */
  loadPartner(username: String) {
    const photo: string = '../assets/images/profile.png';
    this.partnerUser = new User('https://'+ username +'.inrupt.net/profile/card#me', username, photo);
    this.loadChat();
  }
  
  /**
   * This method loads the chat.
   * If the channel exists it uses it else it creates a new channel between the own user and the partner user.
   */
  async loadChat(){
    await this.rdf.getSession();
    try {
      this.currentChannel = await this.rdf.getChannel(this.ownUser.webId, this.partnerUser.webId);
      await this.rdf.createStructure(this.currentChannel);
      this.loadMessagesFromPod();
    } catch (error){
      this.getChannel(this.ownUser);
      await this.rdf.createStructure(this.currentChannel);
      await this.rdf.createNewChat(this.ownUser.webId, this.partnerUser.webId, this.currentChannel);
    }
  }

  /**
   * This method set the communication channel between the own user and the partner.
   * @param ownUser 
   */
  private getChannel(ownUser: User) {
    this.currentChannel = this.ownUser.webId.replace('profile/card#me', 'public/' + ownUser.username + '-' 
    + this.partnerUser.username + '/chat.ttl');
  }  
  
  private getPartnerChannel(partnerUser: User) {
    this.currentPartnerChannel = this.partnerUser.webId.replace('profile/card#me', 'public/' + partnerUser.username + '-' 
    + this.ownUser.username + '/chat.ttl');
  }  

  /**
   * This is the method to send messages between the own user and the partner user.
   * @param message 
   * @param partner
   */
  async sendMessage(msg: ChatMessage, partner: String) {
    this.addMessage(msg);
    await this.rdf.getSession();
    if(!this.rdf.session){
      return ;
    }
    try {
      this.currentPartnerChannel = await this.rdf.getChannel(this.partnerUser.webId, this.ownUser.webId);
    } catch (error){
      this.getPartnerChannel(this.partnerUser);
      await this.rdf.createNewChat(this.partnerUser.webId, this.ownUser.webId, this.currentPartnerChannel);
    }
    await this.rdf.addMessage(await this.currentChannel, msg, this.ownUser.webId, this.currentPartnerChannel);
  }

  /**
   * This method add a message to the array of messages called chatMessages.
   * @param message 
   */
  private addMessage(message: ChatMessage){
    this.chatMessages.push(message);
  }

  private getFriends(): Observable<User[]> {
    return of(this.friendsList);
  }

  /**
   * Loads all the messages stored in our pod
   */
  private async loadMessagesFromPod() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    const messages = await this.rdf.getMessagesFromPod(this.currentChannel);
    await messages.forEach(e => {
      this.chatMessages.push(e);
    });
  }

}