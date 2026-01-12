export interface Section {
  name: string;
  members: Member[];
}

export interface Member {
  name: string;
  role?: string;
  degree?: string;
}
