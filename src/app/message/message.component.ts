import { Component, OnInit, Input } from '@angular/core';
import {Router} from '@angular/router';
import { ChatMessage } from '../../app/models/chat-message.model';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})

/**
 * This is the message component with the time of it
 */
export class MessageComponent implements OnInit {

    @Input() chatMessage: ChatMessage;
    author: string;
    message: string;
    time: string;
    isOwn: boolean;

    constructor() { }

    ngOnInit(chatMessage = this.chatMessage) {
        this.message = chatMessage.message;
        this.author = chatMessage.userName;
        this.time = this.getTimeStamp(chatMessage.timeSent);
        if (this.author) {
            this.isOwn = true;
        } else {
            this.isOwn = false;
        }
    }

    getTimeStamp(date: Date) {

        const day = date.getUTCFullYear() + '/' +
                    (date.getUTCMonth() + 1) + '/' +
                    date.getUTCDate();

        const time = date.getUTCHours() + ':' +
                    date.getUTCMinutes();

        return day + ' ' + time;
    }
}
