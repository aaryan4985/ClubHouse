// src/types.ts

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imagePath?: string;
}
  
  export interface Club {
    id: string;
    name: string;
    description: string;
    imageUrl?: string; // Optional, if applicable
    members?: { id: string; name: string }[]; // Optional: Array of member objects
  }

  
export interface EventCardProps {

  event: {

    id: string;

    name: string;

    description: string;

    venue: string;

    timing: string;

    date: string;

    imagePath?: string;

    rules: string;

  };

  onClick: () => void;

}

  