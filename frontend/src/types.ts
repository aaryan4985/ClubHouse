// src/types.ts
export interface Event {
    id: string;
    title: string;
    date: string;
    image: string;
    description: string;
  }
  
  export interface Club {
    id: string;
    name: string;
    description: string;
    logo?: string;
  }
  

  export interface Club {
    id: string;
    name: string;
    description: string;
    logo?: string; // Optional, if applicable
    members?: { id: string; name: string }[]; // Ensure it's defined as an array of objects
  }