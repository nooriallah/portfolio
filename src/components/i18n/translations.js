/**
 * src/components/i18n/translations.js — LEGACY TEXTS (seed source only).
 *
 * The live site no longer reads this file: all texts come from the database
 * and are edited in /admin. `scripts/seed.mjs` reads this file ONCE to fill
 * the database the first time. You can delete it after seeding if you like.
 */
export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "ps", label: "پښتو", dir: "rtl" },
];

export const translations = {
  // ---------------- ENGLISH ----------------
  en: {
    nav: {
      home: "Home",
      about: "About",
      work: "Work",
      experience: "Experience",
      skills: "Skills",
      services: "Services",
      reviews: "Reviews",
      contact: "Contact",
    },
    ui: {
      hireMe: "Hire Me",
      downloadCv: "Download CV",
      viewWork: "View Work",
      prevPage: "Previous page",
      nextPage: "Next page",
      page: "Page",
    },
    roles: ["Web Developer", "Programmer", "Front-End Engineer", "Freelancer"],
    hero: {
      greeting: "Hi, I'm",
      name: "Noorullah Qayoumi",
      intro: "I am a {role}",
      tagline:
        "Creative developer specializing in front-end with solid back-end skills, turning ideas into fast, clean, reliable web experiences.",
    },
    sections: {
      about: { eyebrow: "About", title: "About Me" },
      work: {
        eyebrow: "Portfolio",
        title: "Selected Work",
        visit: "Visit website",
      },
      experience: { eyebrow: "Quality", title: "Experience & Education" },
      skills: { eyebrow: "Skills", title: "What I Work With" },
      services: { eyebrow: "Services", title: "What I Offer" },
      reviews: { eyebrow: "Review", title: "What Clients Say" },
      contact: { eyebrow: "Contact", title: "Let's Work Together" },
    },
    about: {
      heading: "Web Developer & Programmer",
      text: "Creative web developer specializing in front-end and back-end development, familiar with the full development cycle for web application projects and well-versed in numerous languages, frameworks and CMS platforms.",
      facts: [
        ["Degree", "Bachelor in CS"],
        ["Experience", "4+ Years"],
        ["Location", "Kabul, Afghanistan"],
        ["Freelance", "Available"],
        ["Email", "nooriallah18@gmail.com"],
        ["Birthday", "19 March"],
      ],
    },
    skills: {
      frontend: "Front-End",
      backend: "Back-End",
      databases: "Databases",
      tools: "CMS & Tools",
      languages: "Languages",
    },
    services: {
      frontend: {
        title: "Front-End Development",
        desc: "Responsive, accessible interfaces built with React and modern CSS.",
      },
      backend: {
        title: "Back-End & APIs",
        desc: "Server-side logic and REST APIs with PHP/Laravel and Livewire.",
      },
      cms: {
        title: "WordPress & CMS",
        desc: "Custom themes, plugins and content systems for fast launches.",
      },
      apps: {
        title: "Web Applications",
        desc: "Full single-page apps from concept to deployment.",
      },
      db: {
        title: "Database Design",
        desc: "Well-structured, performant MySQL database schemas.",
      },
      support: {
        title: "Maintenance & Support",
        desc: "Ongoing fixes, optimization and feature work.",
      },
    },
    work: [
      {
        title: "Samangan Journal Publishing System",
        desc: "Academic journal management system built around OJS workflows.",
      },
      {
        title: "Amanzada Online Store",
        desc: "Storefront with cart, payments and an admin dashboard.",
      },
      {
        title: "The Hope Projects",
        desc: "Custom-themed marketing site with a CMS for the client team.",
      },
      {
        title: "React Dashboard",
        desc: "Data-driven admin panel with charts and role-based access.",
      },
    ],
    workNote: "A selection of recent projects — more available on request.",
    experience: {
      heading: "My Experience",
      items: [
        {
          year: "2021 — Present",
          title: "Freelance Web Developer",
          place: "Self-employed",
          desc: "Building web apps and sites for clients across WordPress, PHP, Laravel and React.",
        },
        {
          year: "2024 — Present",
          title: "Web Developer",
          place: "Shenaas Marketing Agency, Kabul",
          desc: "Developing and maintaining client websites at Shenaas, a marketing agency in Kabul.",
        },
        {
          year: "2023 — 2024",
          title: "Web Developer",
          place: "OBRANG & BP, Kabul",
          desc: "Built innovative digital solutions at Obrang & Brightpoint.",
        },
        {
          year: "2022",
          title: "Surveyor / SCOPE Registration Officer",
          place: "ASOW, Kabul & Bamian",
          desc: "Biometric registration officer using advanced identification technology.",
        },
      ],
    },
    education: {
      heading: "My Education",
      items: [
        {
          year: "Graduated",
          title: "Bachelor in Computer Science",
          place: "Kabul, Afghanistan",
          desc: "Foundations in software engineering, databases and web technologies.",
        },
        {
          year: "2023 — Present",
          title: "PHP, Laravel & Livewire",
          place: "Laracasts (Online)",
          desc: "Proficient in PHP, Laravel and Livewire via the Laracasts course.",
        },
        {
          year: "2023",
          title: "JavaScript & React.js",
          place: "Scrimba (Online)",
          desc: "Skilled in JavaScript and React.js, completed Scrimba's course.",
        },
        {
          year: "Ongoing",
          title: "Continuous Learning",
          place: "Online (Laracasts, Scrimba, YouTube)",
          desc: "Modern JS & PHP frameworks, DevOps and cloud deployment.",
        },
      ],
    },
    reviews: [
      {
        role: "Product Designer / Rashha Design",
        text: "A fantastic experience! He delivered a beautifully crafted website that perfectly captured our vision. Highly recommended for expertise and professionalism.",
      },
      {
        role: "CEO / Maham Tejarat Arshin",
        text: "Incredibly impressed with his web development skills. He transformed our ideas into a user-friendly and visually stunning website.",
      },
      {
        role: "Sales Manager / LBtak",
        text: "His expertise in PHP and React brought our project to life. Prompt communication and exceptional work ethic made the process seamless.",
      },
    ],
    contact: {
      items: [
        { label: "Email", value: "nooriallah18@gmail.com" },
        { label: "Phone", value: "+93 (0) 773 77 17 16" },
        { label: "Location", value: "Poli-e-sorkh, Karte-3, Kabul" },
      ],
      qrText: "Scan to save my contact details.",
      form: {
        name: "Your Name",
        email: "Your Email",
        subject: "Subject",
        message: "Your Message",
        send: "Send Message",
        sending: "Sending...",
        sent: "Thanks! Your message has been sent.",
        error: "Something went wrong. Please try again or email me directly.",
      },
    },
    footer: { rights: "All rights reserved." },
  },

  // ---------------- دری (PERSIAN / DARI) ----------------
  fa: {
    nav: {
      home: "خانه",
      about: "درباره",
      work: "کارها",
      experience: "تجربه",
      skills: "مهارت‌ها",
      services: "خدمات",
      reviews: "نظرات",
      contact: "تماس",
    },
    ui: {
      hireMe: "همکاری با من",
      downloadCv: "دانلود سی‌وی",
      viewWork: "مشاهده کارها",
      prevPage: "صفحه قبلی",
      nextPage: "صفحه بعدی",
      page: "صفحه",
    },
    roles: ["توسعه‌دهنده وب", "برنامه‌نویس", "مهندس فرانت‌اند", "فریلنسر"],
    hero: {
      greeting: "سلام، من",
      name: "نورالله قیومی",
      intro: "من یک {role} هستم",
      tagline:
        "توسعه‌دهنده خلاق با تخصص در فرانت‌اند و مهارت‌های قوی بک‌اند که ایده‌ها را به تجربه‌های ویبی قابل‌اعتماد تبدیل می‌کند.",
    },
    sections: {
      about: { eyebrow: "درباره", title: "درباره من" },
      work: {
        eyebrow: "نمونه‌کار",
        title: "پروژه های تکمیل شده",
        visit: "مشاهده وبسایت",
      },
      experience: { eyebrow: "کیفیت", title: "تجربه و تحصیلات" },
      skills: { eyebrow: "مهارت‌ها", title: "با چه چیزهایی کار می‌کنم" },
      services: { eyebrow: "خدمات", title: "چه خدماتی ارائه می‌دهم" },
      reviews: { eyebrow: "نظرات", title: "نظر مشتریان" },
      contact: { eyebrow: "تماس", title: "بیایید با هم کار کنیم" },
    },
    about: {
      heading: "توسعه‌دهنده وب و برنامه‌نویس",
      text: "توسعه‌دهنده خلاق وب با تخصص در توسعه فرانت‌اند و بک‌اند، آشنا با چرخه کامل توسعه پروژه‌های تحت وب و مسلط بر زبان‌ها، فریم‌ورک‌ها و سیستم‌های مدیریت محتوای متعدد.",
      facts: [
        ["درجه تحصیل", "لیسانس کامپیوتر ساینس"],
        ["تجربه", "+۴ سال"],
        ["موقعیت", "کابل، افغانستان"],
        ["فریلنس", "در دسترس"],
        ["ایمیل", "nooriallah18@gmail.com"],
        ["تاریخ تولد", "۱۹ مارچ"],
      ],
    },
    skills: {
      frontend: "فرانت‌اند",
      backend: "بک‌اند",
      databases: "DBMS's",
      tools: "CMS و ابزارها",
      languages: "زبان‌ها",
    },
    services: {
      frontend: {
        title: "توسعه فرانت‌اند",
        desc: "رابط‌های کاربری واکنش‌گرا و دسترس‌پذیر ساخته‌شده با React و CSS مدرن.",
      },
      backend: {
        title: "بک‌اند و API",
        desc: "منطق سمت سرور و REST API با PHP/Laravel و Livewire.",
      },
      cms: {
        title: "وردپرس و CMS",
        desc: "قالب‌ها، افزونه‌ها و سیستم‌های محتوای سفارشی برای راه‌اندازی سریع.",
      },
      apps: {
        title: "اپلیکیشن‌های وب",
        desc: "اپلیکیشن‌های تک‌صفحه‌ای کامل از ایده تا استقرار.",
      },
      db: {
        title: "طراحی پایگاه داده",
        desc: "ساختارهای داده MySQL با ساختار مناسب و کارآمد.",
      },
      support: {
        title: "نگهداری و پشتیبانی",
        desc: "رفع اشکال، بهینه‌سازی و توسعه ویژگی‌ها به‌صورت مستمر.",
      },
    },
    work: [
      {
        title: "سیستم نشر ژورنال سمنگان",
        desc: "سیستم مدیریت ژورنال علمی مبتنی بر گردش‌کار OJS.",
      },
      {
        title: "فروشگاه اینترنتی",
        desc: "فروشگاه با سبد خرید، پرداخت و پنل مدیریت.",
      },
      {
        title: "وب‌سایت شرکتی",
        desc: "سایت بازاریابی با قالب سفارشی و CMS برای تیم مشتری.",
      },
      {
        title: "داشبورد React",
        desc: "پنل مدیریت داده‌محور با نمودار و دسترسی نقش‌محور.",
      },
    ],
    workNote: "گزیده‌ای از پروژه‌های اخیر — موارد بیشتر در صورت درخواست.",
    experience: {
      heading: "تجربه من",
      items: [
        {
          year: "۲۰۲۱ — اکنون",
          title: "توسعه‌دهنده وب فریلنس",
          place: "فری لنسر",
          desc: "ساخت اپلیکیشن‌ها و وب‌سایت‌ها برای مشتریان با WordPress، PHP، Laravel و React.",
        },
        {
          year: "۲۰۲۴ — اکنون",
          title: "توسعه‌دهنده وب",
          place: "آژانس بازاریابی شناس، کابل",
          desc: "توسعه و نگهداری وب‌سایت‌های مشتریان در شناس، یک آژانس بازاریابی در کابل.",
        },
        {
          year: "۲۰۲۳ — ۲۰۲۴",
          title: "توسعه‌دهنده وب",
          place: "OBRANG و BP، کابل",
          desc: "ساخت راه‌حل‌های دیجیتال نوآورانه در Obrang و Brightpoint.",
        },
        {
          year: "۲۰۲۲",
          title: "نقشه‌بردار / مأمور ثبت SCOPE",
          place: "ASOW، کابل و بامیان",
          desc: "مأمور ثبت بیومتریک با استفاده از فناوری پیشرفته شناسایی.",
        },
      ],
    },
    education: {
      heading: "تحصیلات من",
      items: [
        {
          year: "فارغ‌ تحصیل",
          title: "کامپیوتر ساینس",
          place: "کابل، افغانستان",
          desc: "مبانی مهندسی نرم‌افزار، پایگاه داده و فناوری‌های وب.",
        },
        {
          year: "۲۰۲۳ — اکنون",
          title: "PHP، Laravel و Livewire",
          place: "Laracasts (آنلاین)",
          desc: "تسلط بر PHP، Laravel و Livewire از طریق دوره Laracasts.",
        },
        {
          year: "۲۰۲۳",
          title: "JavaScript و React.js",
          place: "Scrimba (آنلاین)",
          desc: "ماهر در JavaScript و React.js، تکمیل دوره Scrimba.",
        },
        {
          year: "در حال یادگیری",
          title: "یادگیری مستمر",
          place: "آنلاین (Laracasts، Scrimba، YouTube)",
          desc: "فریم‌ورک‌های مدرن JS و PHP، DevOps و استقرار ابری.",
        },
      ],
    },
    reviews: [
      {
        role: "طراح محصول / Rashha Design",
        text: "تجربه‌ای فوق‌العاده! او وب‌سایتی زیبا ساخت که دقیقاً چشم‌انداز ما را منعکس می‌کرد. برای تخصص و حرفه‌ای‌گری به‌شدت توصیه می‌شود.",
      },
      {
        role: "مدیرعامل / Maham Tejarat Arshin",
        text: "از مهارت‌های توسعه وب او بسیار تحت تأثیر قرار گرفتم. او ایده‌های ما را به وب‌سایتی کاربرپسند و چشم‌نواز تبدیل کرد.",
      },
      {
        role: "مدیر فروش / LBtak",
        text: "تخصص او در PHP و React پروژه ما را زنده کرد. ارتباط سریع و اخلاق کاری استثنایی روند کار را روان ساخت.",
      },
    ],
    contact: {
      items: [
        { label: "ایمیل", value: "nooriallah18@gmail.com" },
        { label: "تلفن", value: "+93 (0) 773 77 17 16" },
        { label: "موقعیت", value: "پل سرخ، کارته سه، کابل" },
      ],
      qrText: "برای ذخیره اطلاعات تماس من اسکن کنید.",
      form: {
        name: "نام شما",
        email: "ایمیل شما",
        subject: "موضوع",
        message: "پیام شما",
        send: "ارسال پیام",
        sending: "در حال ارسال...",
        sent: "ممنون! پیام شما ارسال شد.",
        error: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید یا مستقیماً ایمیل بزنید.",
      },
    },
    footer: { rights: "تمامی حقوق محفوظ است." },
  },

  // ---------------- پښتو (PASHTO) ----------------
  ps: {
    nav: {
      home: "کور",
      about: "په اړه",
      work: "کارونه",
      experience: "تجربه",
      skills: "مهارتونه",
      services: "خدمتونه",
      reviews: "نظرونه",
      contact: "اړیکه",
    },
    ui: {
      hireMe: "ما استخدام کړئ",
      downloadCv: "سي‌وي ډاونلوډ",
      viewWork: "کارونه وګورئ",
      prevPage: "پخوانی مخ",
      nextPage: "راتلونکی مخ",
      page: "مخ",
    },
    roles: [
      "د ویب پراختیا کوونکی",
      "پروګرامر",
      "د فرنټ‌اینډ انجنیر",
      "فري‌لانسر",
    ],
    hero: {
      greeting: "سلام، زه",
      name: "نورالله قیومی",
      intro: "زه یو {role} یم",
      tagline:
        "یو خلاق پراختیا کوونکی چې په فرنټ‌اینډ کې تخصص لري او د بیک‌اینډ پیاوړي مهارتونه لري، نظرونه چټک، پاک او د باور وړ ویب تجربو ته اړوي.",
    },
    sections: {
      about: { eyebrow: "په اړه", title: "زما په اړه" },
      work: {
        eyebrow: "پورټفولیو",
        title: "ټاکل شوي کارونه",
        visit: "ویب پاڼه وګورئ",
      },
      experience: { eyebrow: "کیفیت", title: "تجربه او زده‌کړه" },
      skills: { eyebrow: "مهارتونه", title: "زه له څه سره کار کوم" },
      services: { eyebrow: "خدمتونه", title: "زه څه وړاندې کوم" },
      reviews: { eyebrow: "نظرونه", title: "پیرودونکي څه وايي" },
      contact: { eyebrow: "اړیکه", title: "راځئ چې یوځای کار وکړو" },
    },
    about: {
      heading: "د ویب پراختیا کوونکی او پروګرامر",
      text: "یو خلاق ویب پراختیا کوونکی چې په فرنټ‌اینډ او بیک‌اینډ پراختیا کې تخصص لري، د ویب اپلیکیشن پروژو د بشپړ پراختیایي دورې سره بلد دی او په ډیرو ژبو، فریم‌ورکونو او د محتوا مدیریت سیسټمونو پوهیږي.",
      facts: [
        ["درجه تحصیل", "لیسانس کامپیوتر ساینس"],
        ["تجربه", "+۴ کاله"],
        ["موقعیت", "کابل، افغانستان"],
        ["فري‌لانس", "شته"],
        ["ایمیل", "nooriallah18@gmail.com"],
        ["د زیږون نیټه", "۱۹ مارچ"],
      ],
    },
    skills: {
      frontend: "فرنټ‌اینډ",
      backend: "بیک‌اینډ",
      databases: "ډیټابیسونه",
      tools: "CMS او وسایل",
      languages: "ژبې",
    },
    services: {
      frontend: {
        title: "د فرنټ‌اینډ پراختیا",
        desc: "ځواب ورکوونکي او د لاسرسي وړ انٹرفیسونه چې د React او عصري CSS په مرسته جوړ شوي.",
      },
      backend: {
        title: "بیک‌اینډ او APIs",
        desc: "د سرور خوا منطق او REST APIs د PHP/Laravel او Livewire سره.",
      },
      cms: {
        title: "وردپرس او CMS",
        desc: "دودیز قالبونه، پلگ‌اینونه او د محتوا سیسټمونه د چټک پیل لپاره.",
      },
      apps: {
        title: "ویب اپلیکیشنونه",
        desc: "بشپړ یو-مخیز اپلیکیشنونه له نظر څخه تر پلي کولو پورې.",
      },
      db: {
        title: "د ډیټابیس ډیزاین",
        desc: "ښه جوړ شوي او اغیزمن MySQL ډیټابیس سکیماوې.",
      },
      support: {
        title: "ساتنه او ملاتړ",
        desc: "دوامداره سمونونه، اصلاح او د ځانګړتیاوو کار.",
      },
    },
    work: [
      {
        title: "د سمنګان ژورنال د خپرونې سیسټم",
        desc: "د OJS د کاري بهیر پر بنسټ د علمي ژورنال د مدیریت سیسټم.",
      },
      {
        title: "آنلاین پلورنځی",
        desc: "د پیرود ټوکري، تادیاتو او اډمین ډشبورډ سره پلورنځی.",
      },
      {
        title: "شرکتي ویب‌پاڼه",
        desc: "د دودیز قالب او CMS سره د بازارموندنې سایټ د پیرودونکي ټیم لپاره.",
      },
      {
        title: "React ډشبورډ",
        desc: "د ډیټا پر بنسټ اډمین پینل د چارټونو او رول-بنسټیز لاسرسي سره.",
      },
    ],
    workNote: "د وروستیو پروژو یوه ټاکنه — نور د غوښتنې پر بنسټ شته.",
    experience: {
      heading: "زما تجربه",
      items: [
        {
          year: "۲۰۲۱ — اوس",
          title: "فري‌لانس ویب پراختیا کوونکی",
          place: "ځان‌بوختیا",
          desc: "د پیرودونکو لپاره د WordPress، PHP، Laravel او React سره د ویب اپونو او سایټونو جوړول.",
        },
        {
          year: "۲۰۲۴ — اوس",
          title: "ویب پراختیا کوونکی",
          place: "د شناس بازارموندنې اژانس، کابل",
          desc: "په شناس کې، چې په کابل کې د بازارموندنې یوه اژانس ده، د پیرودونکو ویب‌پاڼو پراختیا او ساتنه.",
        },
        {
          year: "۲۰۲۳ — ۲۰۲۴",
          title: "ویب پراختیا کوونکی",
          place: "OBRANG او BP، کابل",
          desc: "په Obrang او Brightpoint کې د نوښتګرو ډیجیټل حلونو جوړول.",
        },
        {
          year: "۲۰۲۲",
          title: "سروی‌کوونکی / د SCOPE د راجستر افسر",
          place: "ASOW، کابل او بامیان",
          desc: "د پرمختللي پیژندنې ټکنالوژۍ په کارولو سره د بایومیټریک راجستر افسر.",
        },
      ],
    },
    education: {
      heading: "زما زده‌کړه",
      items: [
        {
          year: "فارغ‌ تحصیل",
          title: "لیسانس کامپیوتر ساینس",
          place: "کابل، افغانستان",
          desc: "د سافټویر انجینرۍ، ډیټابیس او ویب ټکنالوژیو بنسټونه.",
        },
        {
          year: "۲۰۲۳ — اوس",
          title: "PHP، Laravel او Livewire",
          place: "Laracasts (آنلاین)",
          desc: "د Laracasts کورس له لارې په PHP، Laravel او Livewire مهارت.",
        },
        {
          year: "۲۰۲۳",
          title: "JavaScript او React.js",
          place: "Scrimba (آنلاین)",
          desc: "په JavaScript او React.js کې مهارت، د Scrimba کورس بشپړ کړ.",
        },
        {
          year: "روان",
          title: "دوامداره زده‌کړه",
          place: "آنلاین (Laracasts، Scrimba، YouTube)",
          desc: "عصري JS او PHP فریم‌ورکونه، DevOps او کلاوډ پلي کول.",
        },
      ],
    },
    reviews: [
      {
        role: "د محصول ډیزاینر / Rashha Design",
        text: "یوه عالي تجربه! هغه یوه ښکلې ویب‌پاڼه جوړه کړه چې زموږ لیدلوری یې سم انعکاس کړ. د تخصص او مسلکيتوب لپاره ډیر سپارښتل کیږي.",
      },
      {
        role: "اجرايوي رئیس / Maham Tejarat Arshin",
        text: "د هغه د ویب پراختیا مهارتونو زه ډیر اغیزمن کړم. هغه زموږ نظرونه یوې کارن‌دوسته او ښکلې ویب‌پاڼې ته واړول.",
      },
      {
        role: "د پلور مدیر / LBtak",
        text: "د PHP او React کې د هغه تخصص زموږ پروژه ژوندۍ کړه. چټکه اړیکه او استثنایي کاري اخلاقو بهیر اسانه کړ.",
      },
    ],
    contact: {
      items: [
        { label: "ایمیل", value: "nooriallah18@gmail.com" },
        { label: "تلفن", value: "+93 (0) 773 77 17 16" },
        { label: "موقعیت", value: "پل سرخ، کارته دریم، کابل" },
      ],
      qrText: "زما د اړیکو معلومات د خوندي کولو لپاره سکن کړئ.",
      form: {
        name: "ستاسو نوم",
        email: "ستاسو ایمیل",
        subject: "موضوع",
        message: "ستاسو پیغام",
        send: "پیغام ولیږئ",
        sending: "لیږل کیږي...",
        sent: "مننه! ستاسو پیغام ولیږل شو.",
        error:
          "یوه ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ یا مستقیم ایمیل راولیږئ.",
      },
    },
    footer: { rights: "ټول حقونه خوندي دي." },
  },
};
