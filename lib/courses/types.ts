export type Section = {
  id: string;
  title: string;
};

export type Course = {
  id: string;
  year: number;
  title: string;
  sections: Section[];
};

export type CoursesFile = {
  courses: Course[];
};
