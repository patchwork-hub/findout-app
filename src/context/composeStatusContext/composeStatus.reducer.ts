import { tags } from 'react-native-svg/lib/typescript/xml';
import { ComposeAction, ComposeState } from './composeStatus.type';

export const initialState: ComposeState = {
	text: {
		count: 0,
		raw: '',
	},
	spoilerText: '',
	link: {
		isLinkInclude: false,
		firstLinkUrl: '',
		showLinkCard: false,
	},
	disableUserSuggestionsModal: false,
	currentMention: undefined,
	media_ids: [],
	maxCount: 500,
	visibility: 'local',
	in_reply_to_id: undefined,
	language: 'en',
	poll: null,
	sensitive: false,
	schedule: undefined,
	quote_approval_policy: 'public',
};

export function composeReducer(
	state: ComposeState,
	action: ComposeAction,
): ComposeState {
	switch (action.type) {
		case 'text': {
			return { ...state, text: action.payload };
		}
		case 'spoilerText': {
			return { ...state, spoilerText: action.payload };
		}
		case 'tag':
			return { ...state, tag: action.payload };
		case 'maxCount':
			return { ...state, maxCount: action.payload };
		case 'link':
			return { ...state, link: action.payload };
		case 'currentMention':
			return { ...state, currentMention: action.payload };
		case 'replaceMentionText':
			return { ...state, text: action.payload };
		case 'disableUserSuggestionsModal':
			return { ...state, disableUserSuggestionsModal: action.payload };
		case 'media_add':
			return { ...state, media_ids: [...state.media_ids, ...action.payload] };
		case 'media_remove':
			return {
				...state,
				media_ids: state.media_ids.filter(
					(_, index) => index !== action.payload,
				),
			};
		case 'media_replace':
			return {
				...state,
				media_ids: state.media_ids.map(media_id =>
					media_id == action.payload.prevMediaId
						? action.payload.newMediaId
						: media_id,
				),
			};
		case 'visibility_change':
			return { ...state, visibility: action.payload };
		case 'reply_id_change':
			return { ...state, in_reply_to_id: action.payload };
		case 'language':
			return { ...state, language: action.payload };
		case 'poll':
			return { ...state, poll: action.payload };
		case 'clear': {
			return initialState;
		}
		case 'sensitive': {
			return {
				...state,
				sensitive: action.payload,
				spoilerText: action.payload ? state.spoilerText : '',
			};
		}
		case 'schedule': {
			return { ...state, schedule: action.payload };
		}
		case 'schedule-update': {
			return { ...state, ...action.payload };
		}
		case 'draft': {
			return { ...state, ...action.payload };
		}
		case 'add_emoji': {
			const { emoji, position } = action.payload;
			const newRaw =
				state.text.raw.slice(0, position) +
				emoji +
				state.text.raw.slice(position);

			return {
				...state,
				text: {
					...state.text,
					raw: newRaw,
					count: newRaw.length,
				},
			};
		}
		case 'quote_policy_change':
			return { ...state, quote_approval_policy: action.payload };
		default:
			throw new Error(`Unhandled action type:`);
	}
}
