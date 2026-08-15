export type PublicStudent = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
  studyMode: "regular" | "weekend" | null;
  profileCompleted: boolean;
};

export type PublicAdmin = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  permissions: string[];
};
