import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SolidProfile } from '../models/solid-profile.model';
import { RdfService } from '../services/rdf.service';
import { AuthService } from '../services/solid.auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit  {

  profile: SolidProfile;
  profileImage: string;
  loadingProfile: Boolean;

  

  constructor(private rdf: RdfService,
    private route: ActivatedRoute, private auth: AuthService, private r: Router) {}

  ngOnInit() {
    this.loadingProfile = true;
    this.loadProfile();

    // Clear cached profile data
    // TODO: Remove this code and find a better way to get the old data
    localStorage.removeItem('oldProfileData');
  }

  // Loads the profile from the rdf service and handles the response
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


  // Format data coming back from server. Intended purpose is to replace profile image with default if it's missing
  // and potentially format the address if we need to reformat it for this UI
  private setupProfileData() {
    if (this.profile) {
      this.profileImage = this.profile.image ? this.profile.image : '/assets/images/profile.png';
    } else {
      this.profileImage = '/assets/images/profile.png';
    }
  }

  // Example of logout functionality. Normally wouldn't be triggered by clicking the profile picture.
  logout() {
    this.auth.solidSignOut();
  }

  goToChat(){
    this.r.navigateByUrl('chat');
  }

  goToSettings() {
    this.r.navigateByUrl('settings');
  }

  goBack(){
    this.r.navigateByUrl('card');
  }

  goToInfo() {
    this.r.navigateByUrl('information');
  }

  goToProfile(){
    this.r.navigateByUrl('profile');
  }

  goToComments(){
    this.r.navigateByUrl('comments');
  }
}
