import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SolidProfile } from '../models/solid-profile.model';
import { RdfService } from '../services/rdf.service';
import { AuthService } from '../services/solid.auth.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../models/chat-message.model';
import { print } from 'util';
/**
 * We need the chat service to do the operations with the messages.
 */
import { ChatService } from '../services/chat.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { p } from '@angular/core/src/render3';
import { User } from '../models/user.model';
import { delay } from 'q';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [ ChatService ]
})
export class ChatComponent implements OnInit  {

  profile: SolidProfile;
  profileImage: string;
  loadingProfile: Boolean;
  message: string;
  chatMessages: string[] = new Array<string>();

  datos;
  opcionSeleccionada: string = '0';
  selectedPartner: string = '';

  constructor(private rdf: RdfService, private auth: AuthService, private r: Router, private chat: ChatService) {
    this.datos = ["ruizber", "pablomrtnez", "alvz13", "danielllanauni", "vladislavstelmakh", "labra"];
  }

/**
 * Executes this method when the component is used.
 */
  ngOnInit() {
    this.loadingProfile = true;
    this.loadProfile();

    // Clear cached profile data
    // TODO: Remove this code and find a better way to get the old data
    localStorage.removeItem('oldProfileData');
  }

  /**
   * Loads the profile from the rdf service and handles the response
   */
  async loadProfile() {
    try {
      this.loadingProfile = true;
      const profile = await this.rdf.getProfile();
      if (profile) {
        this.profile = profile;
        this.auth.saveOldUserData(profile);
      }
      this.loadingProfile = false;
      this.setupProfileData();
    } catch (error) {
      console.log(`Error: ${error}`);
    }

  }

  /**
   * This method is used to load the partner in the chat
   */
  private selectPartner() {
    this.selectedPartner = this.opcionSeleccionada;
    this.chatMessages.length = 0;
    (<HTMLInputElement> document.getElementById('chatbox')).innerHTML = '';
    this.chat.chatMessages.length = 0; 
    this.chat.loadPartner(this.selectedPartner);
  }

  /**
   * Format data coming back from server. Intended purpose is to replace profile image with default if it's missing
   * and potentially format the address if we need to reformat it for this UI
   */
  private setupProfileData() {
    if (this.profile) {
      this.profileImage = this.profile.image ? this.profile.image : '/assets/images/profile.png';
    } else {
      this.profileImage = '/assets/images/profile.png';
    }
  }

  /**
   * Example of logout functionality. Normally wouldn't be triggered by clicking the profile picture.
   */
  logout() {
    this.auth.solidSignOut();
  }

  /**
   * Method that goes to the settings component.
   */
  goToSettings() {
    this.r.navigateByUrl('settings');
  }

  /**
   * This method goes to the information component.
   */
  goToInfo() {
    this.r.navigateByUrl('information');
  }

  goBack() {
    this.r.navigateByUrl('card');
  }

  /**
   * This mtehod is use to send messages in the chat application.
   * In this method also when you send a message
   * apperas the date when the message was sent and
   * the author of the message in this case with the username of solid.
   */
 sendMessage() {
    let m;
    let message = (<HTMLInputElement> document.getElementById('usermsg')).value;
    this.checkNotEmpty(message);
    if(message != '') {
      let now = new Date();
      let user = this.chat.ownUser.username;
      let msg = new ChatMessage(user, message, now);
      this.chat.sendMessage(msg, this.selectedPartner);
      this.chatMessages.length = 0;
      this.chat.chatMessages.forEach(element => {
        this.chatMessages.push('[' + element.timeSent.getUTCFullYear() + '/' + ('0' + (element.timeSent.getUTCMonth() + 1)).slice(-2) + '/' 
        + ('0' + element.timeSent.getUTCDate()).slice(-2) + ' - ' +  ('0' + element.timeSent.getHours()).slice(-2) + ':' 
        + ('0' + element.timeSent.getMinutes()).slice(-2) + '] - ' + element.userName + ': ' + element.message);
      });
      
      m = '';
      for (let i = 0; i < this.chatMessages.length; i++) {
        m = m + this.chatMessages[i] + '<br>' + '<br>';
      }

      (<HTMLInputElement> document.getElementById('chatbox')).innerHTML = m;
      document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
      (<HTMLInputElement> document.getElementById('usermsg')).value = '';
    }
  }

  /**
   * With this method checks if you write an empty message and shows an alert in that case.
   * @param message
   */
  checkNotEmpty(message: string) {
    if (message.length === 0) {
        alert('You cannot send an empty message');
    }
  }

  
}

