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
export class CharService{

    chatMessages: ChatMessage[] = new Array<ChatMessage>();

    thisUser: BehaviorSubject<User>;
    currentUserWebId: string;

    parnerUser: User;

    friendsList: Array<User> = new Array<User>();

    constructor (private rdf : RdfService, private toastr: ToastrService){
        this.rdf.getSession();
        this.loadUserData().then(response => {
            this.loadFriends();
          });
          this.thisUser = new BehaviorSubject<User>(null);
    }

    private async loadFriends() {
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

      private sortUserByName(u1: User, u2: User) {
        return u1.username.localeCompare(u2.username);
      }

      private async loadUserData() {
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

      public async sendMessage(){
        await this.rdf.getSession();
        if(!this.rdf.session){
          return ;
        }
        const webId = this.rdf.session.webId;
        this.thisUser
      }
     
}