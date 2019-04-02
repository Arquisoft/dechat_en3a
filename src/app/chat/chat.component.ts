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

  constructor(private rdf: RdfService, private auth: AuthService, private r: Router, private chat: ChatService) {
  }

/**
 * Executes this method when the component is used.
 * 
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
        this.loadData();
      }
      this.loadingProfile = false;
      this.setupProfileData();
    } catch (error) {
      console.log(`Error: ${error}`);
    }

  }

  private loadData(){
    this.chat.loadPartner('Ruizber');
    console.log(this.chat.partnerUser.username);
    this.chat.loadChat();
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
   * In this method also when you send a message apperas the date when the message was sent and the author of the message in this case with the username of solid.
   */
 sendMessage() {
    let m = '';
    <HTMLInputElement> document.getElementById('usermsg');
    let message = (<HTMLInputElement> document.getElementById('usermsg')).value;
    this.chat.sendMessage(message);
    let now = new Date();
    let nowYear = now.getUTCFullYear();
    let nowMonth = new Date().getUTCMonth()+1;
    let minutes = now.getUTCMinutes();
    let hours = now.getHours();
    let day = now.getUTCDate();
    let zeroM = '0';
    let zeroH = '0';
    let zeroMo = '0';
    let zeroD = '0';
    if(minutes > 10){
      zeroM = ''
    }
    if(hours > 10) {
      zeroH = '';
    }
    if(nowMonth > 10) {
      zeroMo = '';
    }
    if(day > 10) {
      zeroD = '';
    }
    let user = this.chat.ownUser.username;
    this.chatMessages.push('[' + nowYear + '/' +zeroMo + nowMonth +'/'+ zeroD + day+ ' - ' 
    + zeroH + hours + ':' + zeroM + minutes + '] ' + user + ': ' + message);
    for(let i = 0; i < this.chatMessages.length; i++) {
      m = m + this.chatMessages[i] + '<br>';
    }
    (<HTMLInputElement> document.getElementById('chatbox')).innerHTML = m;
    (<HTMLInputElement> document.getElementById('usermsg')).value = '';
  }


}

