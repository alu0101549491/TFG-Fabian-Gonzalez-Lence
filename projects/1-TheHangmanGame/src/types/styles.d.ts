declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module 'bulma/css/bulma.min.css';

// Allow importing JSON files as modules
declare module '*.json' {
	const value: any;
	export default value;
}
