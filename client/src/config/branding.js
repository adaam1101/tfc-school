export const schoolLogo = import.meta.env.VITE_SCHOOL_LOGO || "/tfc-logo.png";

export const schoolInfo = {
  name:        import.meta.env.VITE_SCHOOL_NAME        || "Training Formation Center",
  short:       import.meta.env.VITE_SCHOOL_SHORT       || "TFC",
  tagline:     import.meta.env.VITE_SCHOOL_TAGLINE     || "Shaping Futures, Building Excellence",
  description: import.meta.env.VITE_SCHOOL_DESCRIPTION || "TFC — Training Formation Center is a premier private educational institution located in the heart of Annaba, Algeria.",
  email:       import.meta.env.VITE_SCHOOL_EMAIL       || "tfcinfo23@gmail.com",
  phones: [
    import.meta.env.VITE_SCHOOL_PHONE1 || "+213 561 502 098",
    import.meta.env.VITE_SCHOOL_PHONE2 || "+213 782 628 711",
  ].filter(Boolean),
  address:     import.meta.env.VITE_SCHOOL_ADDRESS     || "Annaba, beside Dubai Wedding Hall",
  city:        import.meta.env.VITE_SCHOOL_CITY        || "Annaba, Algeria",
  instagram:   import.meta.env.VITE_SCHOOL_INSTAGRAM   || "https://www.instagram.com/tfc.annaba?igsh=NW0wa2o2NWVsb3pv",
  facebook:    import.meta.env.VITE_SCHOOL_FACEBOOK    || "https://www.facebook.com/share/1Cqnoy2Pm8/",
  mapsUrl:     import.meta.env.VITE_SCHOOL_MAPS        || "https://maps.app.goo.gl/uUdRPCDM8krT7iJW7",
  credit:      import.meta.env.VITE_SCHOOL_CREDIT      || "Developed by TFC IT Team",
  heroLine1:   import.meta.env.VITE_HERO_LINE1         || "Training Formation",
  heroLine2:   import.meta.env.VITE_HERO_LINE2         || "Center",
  statStudents: import.meta.env.VITE_STAT_STUDENTS     || "200+",
  statTeachers: import.meta.env.VITE_STAT_TEACHERS     || "15+",
  statCourses:  import.meta.env.VITE_STAT_COURSES      || "27+",
  statYears:    import.meta.env.VITE_STAT_YEARS        || "10+",
};

/* Brand color scale — set per school in Render env vars */
export const brandColors = {
  50:  import.meta.env.VITE_BRAND_50  || "#EEF6FB",
  100: import.meta.env.VITE_BRAND_100 || "#D3E9F5",
  200: import.meta.env.VITE_BRAND_200 || "#A7D2EA",
  300: import.meta.env.VITE_BRAND_300 || "#6AAFC8",
  400: import.meta.env.VITE_BRAND_400 || "#3887AE",
  500: import.meta.env.VITE_BRAND_500 || "#1A6696",
  600: import.meta.env.VITE_BRAND_600 || "#085580",
  700: import.meta.env.VITE_BRAND_700 || "#04436E",
  800: import.meta.env.VITE_BRAND_800 || "#033358",
  900: import.meta.env.VITE_BRAND_900 || "#022242",
  950: import.meta.env.VITE_BRAND_950 || "#011629",
};
