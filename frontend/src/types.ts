// src/types.ts

export interface Event {
    id: string;
    title: string;
    date: string;
    description: string;
    image: string;
  }
  
  export interface Club {
    id: string;
    name: string;
    description: string;
    logo?: string; // Optional, if applicable
    members?: { id: string; name: string }[]; // Optional: Array of member objects
  }
  