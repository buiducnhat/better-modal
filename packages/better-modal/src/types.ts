export type ModalId = string;

export interface ModalState<T = any> {
	id: ModalId;
	isOpen: boolean;
	props: T;
	reject?: (reason: any) => void;
	// We store the promise resolvers here to bridge the UI with the imperative call
	resolve?: (value: any) => void;
}

export interface ModalStore {
	hide: (id: ModalId) => void;
	modals: Record<ModalId, ModalState>;
	open: (id: ModalId, props?: any) => Promise<any>;

	// Actions
	register: (id: ModalId, entry: ModalState) => void;
	reject: (id: ModalId, reason: any) => void;
	remove: (id: ModalId) => void;
	resolve: (id: ModalId, value: any) => void;
}
