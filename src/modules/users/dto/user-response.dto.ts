export type UserProfileResponse = {
  type: "IMAGE" | "GENERATED";
  url?: string;
  color?: string | null;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: UserProfileResponse | null;
};