export type ModalId = string;

export interface ModalState {
	id: ModalId;
	isOpen: boolean;
	props: unknown;
	reject?: (reason: unknown) => void;
	// We store the promise resolvers here to bridge the UI with the imperative call
	resolve?: (value: unknown) => void;
}

export interface ModalStore {
	hide: (id: ModalId) => void;
	modals: Record<ModalId, ModalState>;
	open: (id: ModalId, props?: unknown) => Promise<unknown>;

	// Actions
	register: (id: ModalId, entry: ModalState) => void;
	reject: (id: ModalId, reason: unknown) => void;
	remove: (id: ModalId) => void;
	resolve: (id: ModalId, value: unknown) => void;
}

export interface ModalController<
	TProps = Record<string, unknown>,
	TResult = unknown,
> {
	id: ModalId;
	show: (props?: TProps) => Promise<TResult>;
	hide: () => void;
}

export type ModalComponentProps<
	TProps = Record<string, unknown>,
	TResult = unknown,
> = TProps & {
	modal: {
		visible: boolean;
		props: TProps;
		show: (props?: TProps) => Promise<TResult>;
		hide: () => void;
		remove: () => void;
		resolve: (val: TResult) => void;
		reject: (err: unknown) => void;
	};
};
