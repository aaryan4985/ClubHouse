// src/types.ts

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
}
  
  export interface Club {
    id: string;
    name: string;
    description: string;
    logo?: string; // Optional, if applicable
    members?: { id: string; name: string }[]; // Optional: Array of member objects
    image?: string;
  }
  