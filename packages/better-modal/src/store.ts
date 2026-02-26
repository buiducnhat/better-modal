import type React from "react";
import { create } from "zustand";
import type { ModalId, ModalStore } from "./types";

export const modalRegistry = new Map<ModalId, React.FC<any>>();

export const registerModal = (id: ModalId, Comp: React.FC<any>) => {
	modalRegistry.set(id, Comp);
};

export const useModalStore = create<ModalStore>((set, get) => ({
	modals: {},

	register: (id, entry) => {
		set((state) => ({
			modals: { ...state.modals, [id]: entry },
		}));
	},

	open: (id, props = {}) => {
		return new Promise((resolve, reject) => {
			set((state) => ({
				modals: {
					...state.modals,
					[id]: {
						id,
						isOpen: true,
						props,
						resolve,
						reject,
					},
				},
			}));
		});
	},

	hide: (id) => {
		set((state) => {
			if (!state.modals[id]) {
				return state;
			}
			return {
				modals: {
					...state.modals,
					[id]: { ...state.modals[id], isOpen: false },
				},
			};
		});
	},

	remove: (id) => {
		set((state) => {
			const { [id]: _, ...rest } = state.modals;
			return { modals: rest };
		});
	},

	resolve: (id, value) => {
		const modal = get().modals[id];
		if (modal?.resolve) {
			modal.resolve(value);
		}
		get().hide(id);
	},

	reject: (id, reason) => {
		const modal = get().modals[id];
		if (modal?.reject) {
			modal.reject(reason);
		}
		get().hide(id);
	},
}));
