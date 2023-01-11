import { atom, PrimitiveAtom } from "jotai";
import { TodoItem } from "./interfaces";

export const activeAtom = atom<TodoItem | undefined>(undefined)
