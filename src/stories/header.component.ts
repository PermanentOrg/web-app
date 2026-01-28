import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { User } from './User';

@Component({
	selector: 'storybook-header',
	template: `<header>
		<div class="wrapper">
			<div>
				<svg
					width="32"
					height="32"
					viewBox="0 0 32 32"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g fill="none" fillRule="evenodd">
						<path
							d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
							fill="#FFF"
						/>
						<path
							d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
							fill="#555AB9"
						/>
						<path
							d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z"
							fill="#91BAF8"
						/>
					</g>
				</svg>
				<h1>Acme</h1>
			</div>
			<div>
				@if (user) {
					<div>
						<span class="welcome">
							Welcome, <b>{{ user.name }}</b
							>!
						</span>
						<storybook-button
							size="small"
							(clicked)="logoutClicked.emit($event)"
							label="Log out"
						></storybook-button>
					</div>
				}
				@if (!user) {
					<div>
						<storybook-button
							size="small"
							class="margin-left"
							(clicked)="loginClicked.emit($event)"
							label="Log in"
						></storybook-button>
						<storybook-button
							primary
							size="small"
							primary="true"
							class="margin-left"
							(clicked)="createAccountClicked.emit($event)"
							label="Sign up"
						></storybook-button>
					</div>
				}
			</div>
		</div>
	</header>`,
	styleUrls: ['./header.css'],
})
export default class HeaderComponent {
	@Input()
	user: User | null = null;

	@Output()
	loginClicked = new EventEmitter<Event>();

	@Output()
	logoutClicked = new EventEmitter<Event>();

	@Output()
	createAccountClicked = new EventEmitter<Event>();
}
