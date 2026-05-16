import { create } from 'zustand';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export interface GlobalState {
  projects: any[];
  events: any[];
  clubs: any[];
  notices: any[];
  archives: any[];
  gallery: any[];
  calendar: any[];
  
  projectsLoaded: boolean;
  eventsLoaded: boolean;
  clubsLoaded: boolean;
  noticesLoaded: boolean;
  archivesLoaded: boolean;
  galleryLoaded: boolean;
  calendarLoaded: boolean;

  fetchProjects: () => void;
  fetchEvents: () => void;
  fetchClubs: () => void;
  fetchNotices: () => void;
  fetchArchives: () => void;
  fetchGallery: () => void;
  fetchCalendar: () => void;
}

const activeSubscriptions: Record<string, () => void> = {};

export const useStore = create<GlobalState>((set) => ({
  projects: [],
  events: [],
  clubs: [],
  notices: [],
  archives: [],
  gallery: [],
  calendar: [],

  projectsLoaded: false,
  eventsLoaded: false,
  clubsLoaded: false,
  noticesLoaded: false,
  archivesLoaded: false,
  galleryLoaded: false,
  calendarLoaded: false,

  fetchProjects: () => {
    if (activeSubscriptions['projects']) return;
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions['projects'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ projects: data, projectsLoaded: true });
    }, (error) => {
      console.error("projects subscription error:", error);
      set({ projectsLoaded: true });
    });
  },

  fetchEvents: () => {
    if (activeSubscriptions['events']) return;
    const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(20));
    activeSubscriptions['events'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ events: data, eventsLoaded: true });
    }, (error) => {
      console.error("events subscription error:", error);
      set({ eventsLoaded: true });
    });
  },

  fetchClubs: () => {
    if (activeSubscriptions['clubs']) return;
    const q = query(collection(db, 'clubs'), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions['clubs'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ clubs: data, clubsLoaded: true });
    }, (error) => {
      console.error("clubs subscription error:", error);
      set({ clubsLoaded: true });
    });
  },

  fetchNotices: () => {
    if (activeSubscriptions['notices']) return;
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions['notices'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ notices: data, noticesLoaded: true });
    }, (error) => {
      console.error("notices subscription error:", error);
      set({ noticesLoaded: true });
    });
  },

  fetchArchives: () => {
    if (activeSubscriptions['archives']) return;
    const q = query(collection(db, 'archives'), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions['archives'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ archives: data, archivesLoaded: true });
    }, (error) => {
      console.error("archives subscription error:", error);
      set({ archivesLoaded: true });
    });
  },

  fetchGallery: () => {
    console.log("fetchGallery function executed");
    if (activeSubscriptions['gallery']) {
      console.log("activeSubscriptions['gallery'] already exists, returning early");
      return;
    }
    console.log("Setting up gallery onSnapshot listener...");
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions['gallery'] = onSnapshot(q, (snapshot) => {
      console.log("Gallery onSnapshot SUCCESS! Docs received:", snapshot.docs.length);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ gallery: data, galleryLoaded: true });
    }, (error) => {
      console.error("Gallery onSnapshot ERROR:", error);
      set({ galleryLoaded: true });
    });
  },

  fetchCalendar: () => {
    if (activeSubscriptions['calendar']) return;
    const q = query(collection(db, 'calendar'), orderBy('date', 'asc'), limit(20));
    activeSubscriptions['calendar'] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ calendar: data, calendarLoaded: true });
    }, (error) => {
      console.error("calendar subscription error:", error);
      set({ calendarLoaded: true });
    });
  }
}));
