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

  fetchProjects: (networkId: string) => void;
  fetchEvents: (networkId: string) => void;
  fetchClubs: (networkId: string) => void;
  fetchNotices: (networkId: string) => void;
  fetchArchives: (networkId: string) => void;
  fetchGallery: (networkId: string) => void;
  fetchCalendar: (networkId: string) => void;
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

  fetchProjects: (networkId: string) => {
    const key = `projects_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/projects`), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ projects: data, projectsLoaded: true });
    }, (error) => {
      console.error("projects subscription error:", error);
      set({ projectsLoaded: true });
    });
  },

  fetchEvents: (networkId: string) => {
    const key = `events_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/events`), orderBy('date', 'asc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ events: data, eventsLoaded: true });
    }, (error) => {
      console.error("events subscription error:", error);
      set({ eventsLoaded: true });
    });
  },

  fetchClubs: (networkId: string) => {
    const key = `clubs_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/clubs`), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ clubs: data, clubsLoaded: true });
    }, (error) => {
      console.error("clubs subscription error:", error);
      set({ clubsLoaded: true });
    });
  },

  fetchNotices: (networkId: string) => {
    const key = `notices_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/notices`), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ notices: data, noticesLoaded: true });
    }, (error) => {
      console.error("notices subscription error:", error);
      set({ noticesLoaded: true });
    });
  },

  fetchArchives: (networkId: string) => {
    const key = `archives_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/archives`), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ archives: data, archivesLoaded: true });
    }, (error) => {
      console.error("archives subscription error:", error);
      set({ archivesLoaded: true });
    });
  },

  fetchGallery: (networkId: string) => {
    const key = `gallery_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/gallery`), orderBy('createdAt', 'desc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ gallery: data, galleryLoaded: true });
    }, (error) => {
      console.error("Gallery onSnapshot ERROR:", error);
      set({ galleryLoaded: true });
    });
  },

  fetchCalendar: (networkId: string) => {
    const key = `calendar_${networkId}`;
    if (activeSubscriptions[key]) return;
    const q = query(collection(db, `networks/${networkId}/calendar`), orderBy('date', 'asc'), limit(20));
    activeSubscriptions[key] = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ calendar: data, calendarLoaded: true });
    }, (error) => {
      console.error("calendar subscription error:", error);
      set({ calendarLoaded: true });
    });
  }
}));
