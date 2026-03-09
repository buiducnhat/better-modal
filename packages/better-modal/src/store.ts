import type React from "react";
import { create } from "zustand";
import type { ModalId, ModalStore } from "./types";

export const modalRegistry = new Map<
	ModalId,
	React.FC<Record<string, unknown>>
>();

export const registerModal = (
	id: ModalId,
	Comp: React.FC<Record<string, unknown>>,
) => {
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
		// Reject existing promise if modal is reopened before it resolves
		const existing = get().modals[id];
		if (existing?.reject) {
			existing.reject(new Error(`Modal "${id}" was reopened before resolving`));
		}

		return new Promise((resolve, reject) => {
			// Guard against double-resolve: wrap resolvers so they can only fire once
			let settled = false;
			const guardedResolve = (value: unknown) => {
				if (settled) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(
							`[better-modal] Modal "${id}" resolve() called more than once — ignoring.`,
						);
					}
					return;
				}
				settled = true;
				resolve(value);
			};
			const guardedReject = (reason: unknown) => {
				if (settled) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(
							`[better-modal] Modal "${id}" reject() called more than once — ignoring.`,
						);
					}
					return;
				}
				settled = true;
				reject(reason);
			};

			set((state) => ({
				modals: {
					...state.modals,
					[id]: {
						id,
						isOpen: true,
						props,
						resolve: guardedResolve,
						reject: guardedReject,
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
			// Clear callbacks on hide to prevent stale references
			const { resolve: _resolve, reject: _reject, ...rest } = state.modals[id];
			return {
				modals: {
					...state.modals,
					[id]: {
						...rest,
						isOpen: false,
						resolve: undefined,
						reject: undefined,
					},
				},
			};
		});
	},

	remove: (id) => {
		// Reject pending promise when modal is forcibly removed
		const modal = get().modals[id];
		if (modal?.reject) {
			modal.reject(new Error(`Modal "${id}" was removed before resolving`));
		}
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
