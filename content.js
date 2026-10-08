/* EDIT YOUR LINKS HERE. Leave github empty until your actual GitHub profile exists. */
window.PORTFOLIO_CONFIG = Object.freeze({
  email: 'havenpham63729@gmail.com',
  linkedin: 'https://www.linkedin.com/in/havenpham',
  github: 'https://github.com/Haven-Pham',
  resume: 'assets/Pham_Hong_Hieu_CV_DRAFT.pdf',
  profileImage: "assets/profile.jpg",
});

/* Provider logos and certificate screenshots are from your own supplied files.
   No internal employer data, resident number or sensitive identity scans are published. */
window.PORTFOLIO_RECORDS = {
  experience: [
    {id:'hoa-sen', category:'planning', initials:'HS', period:'Oct 2024 – Apr 2025', className:'hoa'},
    {id:'kodai', category:'logistics', initials:'KS', period:'2023 – Aug 2024', className:'kodai'},
    {id:'vietlog', category:'logistics', initials:'VL', period:'Jan – Jul 2023', className:'vietlog'}
  ],
  projects: [
    {id:'retail',category:'analytics',icon:'▥',chips:['Power BI','DAX','KPIs'],status:'development',number:'01'},
    {id:'sql',category:'sql',icon:'⛁',chips:['SQL','CTEs','Window Functions'],status:'starter',number:'02'},
    {id:'inventory',category:'supply',icon:'◈',chips:['Inventory','Python · Learning','Excel'],status:'concept',number:'03'},
    {id:'netflix',category:'analytics',icon:'⌁',chips:['Python','pandas','EDA'],status:'coursework',number:'04'}
  ],
  certificates: [
    {id:'hr-advanced',provider:'HackerRank',type:'hacker',when:'Jun 26, 2026',mark:'H',asset:'assets/certificates/hackerrank-sql-advanced.jpg',kind:'assessment'},
    {id:'hr-intermediate',provider:'HackerRank',type:'hacker',when:'Jun 26, 2026',mark:'H',asset:'assets/certificates/hackerrank-sql-intermediate.jpg',kind:'assessment'},
    {id:'dc-powerbi',provider:'DataCamp',type:'datacamp',when:'Jul 04, 2026',mark:'DC',asset:'assets/certificates/datacamp-power-bi.pdf',kind:'course'},
    {id:'dc-intermediate',provider:'DataCamp',type:'datacamp',when:'Jun 11, 2026',mark:'DC',asset:'assets/certificates/datacamp-intermediate-sql.pdf',kind:'course'},
    {id:'dc-ai',provider:'DataCamp',type:'datacamp',when:'May 31, 2026',mark:'DC',asset:'assets/certificates/datacamp-cleaning-ai.pdf',kind:'course'},
    {id:'dc-intro',provider:'DataCamp',type:'datacamp',when:'May 29, 2026',mark:'DC',asset:'assets/certificates/datacamp-intro-sql.pdf',kind:'course'},
    {id:'mandarin',provider:'Yuan Ze University',type:'language',when:'Dec 26, 2025',mark:'YZ',asset:null,kind:'course'}
  ]
};

window.PORTFOLIO_I18N = {
  en: {
    locale:'English', pageTitle:'Pham Hong Hieu (Haven - 范鴻孝) | Supply Chain & Data Analytics',
    navAbout:'ABOUT ME',navExperience:'EXPERIENCE',navProjects:'PROJECTS',navStack:'WORKFLOW & STACK',navCommunity:'COMMUNITY',navCerts:'CERTIFICATIONS',navContact:'CONTACT',themeLight:'LIGHT',themeDark:'DARK',
    heroBadge:'Supply Chain · Data Analytics · Business Intelligence · Patent Analysis · Technology Convergence · ERP Systems', heroEyebrow:'FROM OPERATIONS TO DATA INSIGHTS', heroGreeting:"Hi there, I'm",heroName:'Pham Hong Hieu (Haven - 范鴻孝)',
    heroSummary:'Connecting real-world logistics and supply chain operations with SQL, Power BI and data-driven decisions. Currently pursuing a Global MBA in Taiwan.',heroLocation:'Based in Taoyuan, Taiwan',
    exploreWork:'EXPLORE MY WORK',viewResume:'VIEW CV (DRAFT)',copyEmail:'Copy Email',emailCopied:'Email address copied!',copyFallback:'Please copy this email: ',
    visualRole:'SUPPLY CHAIN × DATA ANALYTICS',visualInput:'OPERATIONS',visualOutput:'INSIGHT',floatRole:'Supply Chain & Logistics',
    aboutHeading:'Beyond Operations, Into Analytics',aboutStatement:'I bring practical supply chain experience into business analytics.',aboutParagraph:'My professional path includes supplier coordination, inventory tracking, international logistics and ERP-based operational reporting. At Yuan Ze University, I am strengthening my analytical toolkit through SQL, Power BI and business studies. My goal is to turn operational complexity into clear, actionable decisions.',talkAboutWork:'LET’S CONNECT ↗',
    statRoles:'PROFESSIONAL ROLES',statDegrees:'DEGREE PROGRAMS',statHackerrank:'HACKERRANK SQL TESTS',educationTitle:'EDUCATION',mbaDegree:'Global Master of Business Administration',mbaSchool:'Yuan Ze University · Taiwan',mbaYears:'2025 – Present · In progress',bachelorDegree:'BSc, Logistics & Supply Chain Management',bachelorSchool:'HCM University of Technology and Education · Vietnam',bachelorYears:'2020 – 2024 · GPA 8.46/10 · Distinction',
    experienceHeading:'Professional Path & Experience',experienceCaption:'Hands-on work across supply planning, freight forwarding and import/export coordination.',tabAll:'All Roles',tabPlanning:'Supply Planning & ERP',tabLogistics:'Freight & Logistics',dateNote:'Note: The precise Kodai Sangyo start month differs between the older CV versions; the year is shown until confirmed.',
    experienceData:{
      'hoa-sen':{role:'Supply Chain Planner',org:'Hoa Sen Group · Vietnam',summary:'Purchase-order coordination, inventory management and reporting using Oracle ERP.',bullets:['Monitored suppliers and purchasing orders for domestic and imported goods.','Tracked inventory in Oracle ERP and coordinated with warehouse and production teams.','Prepared operational reports to improve stock and distribution visibility.']},
      'kodai':{role:'Sales Logistics Staff',org:'Kodai Sangyo (Vietnam) Co., Ltd.',summary:'Coordinated international shipments and customer-facing freight operations.',bullets:['Prepared freight quotations and coordinated with carriers and overseas agents.','Supported refrigerated cargo schedules, shipping documentation and customs workflows.','Worked with documentation and operations teams to resolve shipment issues.']},
      'vietlog':{role:'Export & Import Trainee',org:'Viet Logistics · Vietnam',summary:'Supported bookings, shipment documents and customs-related processes.',bullets:['Prepared invoices, packing lists, certificates of origin and shipping instructions.','Supported carrier selection, shipment booking and HS-code related tasks.','Coordinated with operational teams across freight-forwarding activities.']}
    },
    projectsHeading:'Highlighted Projects',projectsCaption:'Applied learning and portfolio projects at different stages of development.',projectDisclaimer:'Transparency: project cards clearly distinguish coursework, work in progress, and planned studies. No company-confidential data or unverified results are displayed.',
    projAll:'All Projects',projAnalytics:'Data Analytics',projSql:'SQL',projSupply:'Supply Chain',projDevelopment:'IN DEVELOPMENT',projStarter:'STARTER INCLUDED',projConcept:'PLANNED',projCoursework:'COURSEWORK · REVIEW',projectDetails:'EXPLORE CASE STUDY',dialogProblem:'GOAL',dialogMethods:'APPROACH',dialogEvidence:'CURRENT STATE',dialogClose:'CLOSE',projectData:{
      retail:{title:'Retail Sales Performance Dashboard',description:'A Power BI dashboard focused on retail KPIs and store performance.',goal:'Analyze revenue, average order value, store rankings and online delivery lead time.',methods:'Power BI visuals, DAX measures and interactive business reporting.',evidence:'Based on coursework and ongoing dashboard development. Final outputs and screenshots must be reviewed before publication.'},
      sql:{title:'SQL for Supply Chain Analytics',description:'A transparent demo SQL project with a small synthetic order dataset.',goal:'Calculate fulfillment lead time, late deliveries and order-level operational indicators.',methods:'SQL joins, case logic, grouping and window functions. Includes sample CSV and SQL files in this package.',evidence:'A reproducible STARTER with synthetic data; not an actual employer performance analysis.'},
      inventory:{title:'Inventory Optimization Case Study',description:'A proposed study of inventory segmentation, replenishment and stock availability.',goal:'Explore ABC classification, inventory turnover and reorder-point scenarios.',methods:'Excel/Python learning roadmap with public or simulated inventory data.',evidence:'Planned project. Results and code will be added after completion.'},
      netflix:{title:'Netflix Dataset Exploration',description:'Exploratory data-cleaning and visualization exercise with Python.',goal:'Inspect content distribution and changes across release years and content types.',methods:'pandas cleaning, exploratory charts and explanatory annotations.',evidence:'Coursework referenced in prior learning tasks. Repository and reviewed findings have not yet been published.'}
    },
    stackHeading:'From Data to Decisions',stackCaption:'Select a workflow stage to see how my current toolkit supports operational analytics.',stackWorkflow:'6-STEP WORKFLOW',stackSkills:'SKILLS MATRIX',stageBadge:'SELECT A STAGE',toolkitTitle:'RELEVANT TOOLS & PRACTICES',
    stages:[
      {number:'01',name:'DATA SOURCES',sub:'Orders, shipments & ERP records',desc:'Start with operational questions and data originating from inventory, procurement and logistics processes.',tools:['Oracle ERP','Excel','Operational KPIs']},
      {number:'02',name:'DATA CLEANING',sub:'Quality & consistency',desc:'Standardize fields, identify missing records and document assumptions before reporting.',tools:['SQL','Excel','DataCamp coursework']},
      {number:'03',name:'SQL ANALYSIS',sub:'Joins, aggregation & logic',desc:'Build reproducible queries and compare operational performance across periods and categories.',tools:['SQL Intermediate / Advanced tests','CTEs','Window functions']},
      {number:'04',name:'BI & REPORTING',sub:'Dashboards & visualization',desc:'Turn results into comprehensible visuals and drill-down dashboards for decision support.',tools:['Power BI','DAX practice','Data storytelling']},
      {number:'05',name:'SUPPLY CHAIN',sub:'Planning & operations context',desc:'Connect analysis back to inventory flows, supplier performance and fulfillment processes.',tools:['Inventory management','Planning','Freight forwarding']},
      {number:'06',name:'DECISION SUPPORT',sub:'Communicate and improve',desc:'Explain findings, limits and recommendations clearly to operational stakeholders.',tools:['KPI reporting','Business communication','Global MBA']}
    ],
    skillsGroups:[{name:'Analytics & BI',items:['SQL','Power BI','Excel','Data visualization','Data cleaning','Python (learning)']},{name:'Supply Chain',items:['Supply planning','Inventory management','Import / export','Freight forwarding','Procurement coordination']},{name:'Enterprise Systems',items:['Oracle ERP (work)','SAP Business One (exposure)','Odoo (exposure)']},{name:'Business Skills',items:['Operational reporting','Stakeholder coordination','English – TOEIC 840 (earlier CV)','Mandarin – YZU Level 2 course']}],
    communityHeading:'Learning & Community',communityCaption:'Education, professional exposure and volunteer activity beyond my day-to-day roles.',communities:[{icon:'♡',title:'Blood Donation Volunteer',detail:'Volunteer blood donation activity through Thu Duc City Red Cross Society, as described in earlier CVs.',meta:'COMMUNITY'},{icon:'⌘',title:'Industry Visits & Workshops',detail:'Attended logistics-related field visits and events, including Lazada Vietnam and Cai Mep–Thi Vai Port.',meta:'INDUSTRY LEARNING'},{icon:'◉',title:'Mandarin Intensive Learning',detail:'Completed Mandarin Intensive Program – Mandarin Level 2 at Yuan Ze University in December 2025.',meta:'LANGUAGES'}],
    certsHeading:'Professional Certifications',certCount:'07 DOCUMENTED',certsCaption:'Selected skill assessments and course completion documents supplied with my portfolio.',certAll:'All',certHacker:'HackerRank',certDatacamp:'DataCamp',certLang:'Language',certView:'VIEW DOCUMENT ↗',certPrivate:'PRIVATE RECORD',certPrivacy:'For privacy, the Mandarin completion scan containing a residence number is not publicly downloadable. Certificates are not professional licences unless explicitly stated.',certKindAssessment:'SKILL TEST',certKindCourse:'COURSE COMPLETION',
    certNames:{'hr-advanced':'SQL (Advanced)','hr-intermediate':'SQL (Intermediate)','dc-powerbi':'Data Visualization in Power BI','dc-intermediate':'Intermediate SQL','dc-ai':'Cleaning Data with Generative AI','dc-intro':'Introduction to SQL','mandarin':'Mandarin Intensive Program – Level 2'},
    contactHeading:'Let’s Connect',contactCaption:'Open to conversations about analytics, operations, learning projects and relevant professional opportunities.',preferredContact:'PREFERRED CONTACT',contactEmail:'Email',contactEmailSub:'Send me a message',contactLinkedIn:'LinkedIn',contactLinkedInSub:'Professional profile',contactGithub:'GitHub',contactGithubSub:'Profile link to be added',contactResume:'Resume',contactResumeSub:'Download draft CV',comingSoon:'COMING SOON',footerNote:'Built as a multilingual, static portfolio · Details pending final review',backToTop:'BACK TO TOP ↑'
  },
  vi: {
    locale:'Tiếng Việt',pageTitle:'Pham Hong Hieu (Haven - 范鴻孝) | Chuỗi cung ứng × Phân tích dữ liệu',
    navAbout:'GIỚI THIỆU',navExperience:'KINH NGHIỆM',navProjects:'DỰ ÁN',navStack:'QUY TRÌNH & KỸ NĂNG',navCommunity:'CỘNG ĐỒNG',navCerts:'CHỨNG CHỈ',navContact:'LIÊN HỆ',themeLight:'SÁNG',themeDark:'TỐI',
    heroBadge:'Chuỗi cung ứng · Phân tích dữ liệu · BI',heroEyebrow:'TỪ VẬN HÀNH ĐẾN THÔNG TIN PHÂN TÍCH',heroGreeting:'Xin chào, tôi là',heroName:'Phạm Hồng Hiếu',
    heroSummary:'Kết hợp kinh nghiệm logistics và quản lý chuỗi cung ứng với SQL, Power BI và tư duy ra quyết định dựa trên dữ liệu. Hiện tôi đang học Global MBA tại Đài Loan.',heroLocation:'Hiện sống tại Đào Viên, Đài Loan',
    exploreWork:'KHÁM PHÁ DỰ ÁN',viewResume:'XEM CV (BẢN NHÁP)',copyEmail:'Sao chép email',emailCopied:'Đã sao chép email!',copyFallback:'Vui lòng sao chép email: ',
    visualRole:'CHUỖI CUNG ỨNG × PHÂN TÍCH DỮ LIỆU',visualInput:'VẬN HÀNH',visualOutput:'THÔNG TIN',floatRole:'Chuỗi cung ứng & Logistics',
    aboutHeading:'Từ vận hành đến phân tích dữ liệu',aboutStatement:'Tôi vận dụng kinh nghiệm chuỗi cung ứng thực tế vào phân tích kinh doanh.',aboutParagraph:'Tôi đã tham gia điều phối nhà cung cấp, theo dõi tồn kho, logistics quốc tế và báo cáo vận hành trên hệ thống ERP. Tại Đại học Nguyên Trí, tôi tiếp tục xây dựng kỹ năng SQL, Power BI và kiến thức kinh doanh nhằm chuyển những vấn đề vận hành phức tạp thành thông tin rõ ràng, có thể hành động.',talkAboutWork:'KẾT NỐI VỚI TÔI ↗',
    statRoles:'VỊ TRÍ ĐÃ ĐẢM NHIỆM',statDegrees:'CHƯƠNG TRÌNH ĐẠI HỌC/THẠC SĨ',statHackerrank:'BÀI THI SQL HACKERRANK',educationTitle:'HỌC VẤN',mbaDegree:'Thạc sĩ Quản trị Kinh doanh Toàn cầu (Global MBA)',mbaSchool:'Đại học Nguyên Trí · Đài Loan',mbaYears:'2025 – hiện tại · Đang theo học',bachelorDegree:'Cử nhân Logistics và Quản lý chuỗi cung ứng',bachelorSchool:'ĐH Sư phạm Kỹ thuật TP.HCM · Việt Nam',bachelorYears:'2020 – 2024 · GPA 8,46/10 · Loại Giỏi',
    experienceHeading:'Hành trình nghề nghiệp & kinh nghiệm',experienceCaption:'Kinh nghiệm thực tế trong hoạch định cung ứng, giao nhận vận tải và điều phối xuất nhập khẩu.',tabAll:'Tất cả',tabPlanning:'Hoạch định & ERP',tabLogistics:'Vận tải & Logistics',dateNote:'Lưu ý: Hai bản CV cũ ghi khác nhau về tháng bắt đầu làm việc tại Kodai Sangyo; tạm hiển thị năm cho đến khi xác nhận.',
    experienceData:{
      'hoa-sen':{role:'Nhân viên Hoạch định Chuỗi cung ứng',org:'Tập đoàn Hoa Sen · Việt Nam',summary:'Điều phối đơn mua hàng, quản lý tồn kho và lập báo cáo trên Oracle ERP.',bullets:['Theo dõi nhà cung cấp và đơn mua hàng trong nước, nhập khẩu.','Quản lý dữ liệu tồn kho trên Oracle ERP, phối hợp với kho và nhà máy.','Lập báo cáo vận hành nhằm hỗ trợ việc theo dõi hàng tồn và phân phối.']},
      'kodai':{role:'Nhân viên Kinh doanh Logistics',org:'Kodai Sangyo (Việt Nam)',summary:'Điều phối hàng hóa quốc tế và các nghiệp vụ giao nhận với khách hàng.',bullets:['Lập báo giá vận chuyển, liên hệ hãng tàu và đại lý quốc tế.','Hỗ trợ lịch trình hàng đông lạnh, chứng từ vận tải và thủ tục hải quan.','Phối hợp với các bộ phận chứng từ và vận hành để xử lý sự cố.']},
      'vietlog':{role:'Thực tập sinh Xuất nhập khẩu',org:'Viet Logistics · Việt Nam',summary:'Hỗ trợ đặt chỗ, chứng từ và các quy trình liên quan đến hải quan.',bullets:['Chuẩn bị hóa đơn, phiếu đóng gói, C/O và hướng dẫn gửi hàng.','Hỗ trợ lựa chọn hãng vận chuyển, booking và các công việc liên quan mã HS.','Phối hợp với bộ phận vận hành trong nghiệp vụ giao nhận hàng hóa.']}
    },
    projectsHeading:'Các dự án nổi bật',projectsCaption:'Các bài thực hành và dự án portfolio ở những giai đoạn phát triển khác nhau.',projectDisclaimer:'Minh bạch: mỗi dự án được ghi rõ là bài tập, đang xây dựng hoặc dự kiến thực hiện. Không công bố dữ liệu nội bộ doanh nghiệp hay kết quả chưa được xác minh.',
    projAll:'Tất cả',projAnalytics:'Phân tích dữ liệu',projSql:'SQL',projSupply:'Chuỗi cung ứng',projDevelopment:'ĐANG XÂY DỰNG',projStarter:'CÓ BẢN MẪU',projConcept:'DỰ KIẾN',projCoursework:'BÀI TẬP · CẦN DUYỆT',projectDetails:'XEM CHI TIẾT',dialogProblem:'MỤC TIÊU',dialogMethods:'PHƯƠNG PHÁP',dialogEvidence:'TÌNH TRẠNG HIỆN TẠI',dialogClose:'ĐÓNG',projectData:{
      retail:{title:'Dashboard Hiệu suất Bán lẻ',description:'Dashboard Power BI tập trung vào KPI bán lẻ và hiệu suất từng cửa hàng.',goal:'Phân tích doanh thu, giá trị đơn hàng trung bình, xếp hạng cửa hàng và thời gian giao hàng của kênh online.',methods:'Biểu đồ Power BI, công thức DAX và báo cáo tương tác.',evidence:'Phát triển từ bài thực hành và dashboard đang xây dựng. Cần kiểm tra kết quả và ảnh trước khi công bố.'},
      sql:{title:'SQL cho Phân tích Chuỗi cung ứng',description:'Dự án SQL minh họa với bộ dữ liệu đơn hàng giả lập quy mô nhỏ.',goal:'Tính thời gian hoàn thành đơn hàng, giao trễ và các chỉ số vận hành.',methods:'SQL JOIN, CASE, GROUP BY và hàm cửa sổ. Gói tải xuống có dữ liệu CSV và mã SQL mẫu.',evidence:'BẢN MẪU tái lập được trên dữ liệu giả lập, không phải phân tích hiệu suất doanh nghiệp thực.'},
      inventory:{title:'Nghiên cứu Tối ưu hóa Tồn kho',description:'Đề xuất nghiên cứu phân nhóm tồn kho, bổ sung hàng và rủi ro thiếu hàng.',goal:'Khảo sát phân loại ABC, vòng quay tồn kho và kịch bản điểm đặt hàng lại.',methods:'Lộ trình học Excel/Python với dữ liệu công khai hoặc mô phỏng.',evidence:'Dự án trong kế hoạch; chưa có kết quả và mã nguồn hoàn chỉnh.'},
      netflix:{title:'Khám phá Dữ liệu Netflix',description:'Bài tập khám phá dữ liệu, làm sạch và trực quan hóa bằng Python.',goal:'Khám phá cơ cấu nội dung và thay đổi theo năm phát hành và loại nội dung.',methods:'Làm sạch dữ liệu với pandas, vẽ biểu đồ EDA và chú giải.',evidence:'Bài tập từng được thực hiện trong quá trình học; chưa công bố repository và kết quả được rà soát.'}
    },
    stackHeading:'Từ dữ liệu đến quyết định',stackCaption:'Chọn từng công đoạn để xem cách bộ kỹ năng hiện tại hỗ trợ phân tích hoạt động.',stackWorkflow:'QUY TRÌNH 6 BƯỚC',stackSkills:'MA TRẬN KỸ NĂNG',stageBadge:'CHỌN CÔNG ĐOẠN',toolkitTitle:'CÔNG CỤ & NGHIỆP VỤ LIÊN QUAN',
    stages:[
      {number:'01',name:'NGUỒN DỮ LIỆU',sub:'Đơn hàng, lô hàng & dữ liệu ERP',desc:'Xuất phát từ câu hỏi vận hành và các nguồn dữ liệu tồn kho, mua hàng, giao nhận.',tools:['Oracle ERP','Excel','KPI vận hành']},
      {number:'02',name:'LÀM SẠCH',sub:'Chất lượng & tính nhất quán',desc:'Chuẩn hóa trường dữ liệu, tìm bản ghi thiếu và ghi nhận giả định trước khi báo cáo.',tools:['SQL','Excel','Khóa học DataCamp']},
      {number:'03',name:'PHÂN TÍCH SQL',sub:'JOIN, tổng hợp & điều kiện',desc:'Viết truy vấn có thể tái lập và so sánh hiệu suất theo thời gian, nhóm dữ liệu.',tools:['SQL Intermediate / Advanced','CTE','Hàm cửa sổ']},
      {number:'04',name:'BI & BÁO CÁO',sub:'Dashboard & trực quan hóa',desc:'Chuyển kết quả phân tích thành dashboard dễ hiểu, hỗ trợ xem sâu vào dữ liệu.',tools:['Power BI','Thực hành DAX','Kể chuyện bằng dữ liệu']},
      {number:'05',name:'CHUỖI CUNG ỨNG',sub:'Hoạch định & bối cảnh thực tiễn',desc:'Liên hệ phân tích với luồng tồn kho, hiệu suất nhà cung cấp và quy trình giao hàng.',tools:['Quản lý tồn kho','Hoạch định','Giao nhận']},
      {number:'06',name:'HỖ TRỢ QUYẾT ĐỊNH',sub:'Trình bày và cải tiến',desc:'Diễn giải phát hiện, giới hạn và đề xuất rõ ràng với các bên liên quan.',tools:['Báo cáo KPI','Giao tiếp kinh doanh','Global MBA']}
    ],
    skillsGroups:[{name:'Phân tích & BI',items:['SQL','Power BI','Excel','Trực quan hóa dữ liệu','Làm sạch dữ liệu','Python (đang học)']},{name:'Chuỗi cung ứng',items:['Hoạch định cung ứng','Quản lý tồn kho','Xuất nhập khẩu','Giao nhận vận tải','Điều phối mua hàng']},{name:'Hệ thống doanh nghiệp',items:['Oracle ERP (thực tế)','SAP Business One (đã tiếp cận)','Odoo (đã tiếp cận)']},{name:'Kỹ năng kinh doanh',items:['Báo cáo vận hành','Phối hợp phòng ban','Tiếng Anh – TOEIC 840 (CV cũ)','Tiếng Trung – hoàn thành khóa Level 2 tại YZU']}],
    communityHeading:'Học hỏi & cộng đồng',communityCaption:'Hoạt động tình nguyện và trải nghiệm chuyên môn ngoài công việc hằng ngày.',communities:[{icon:'♡',title:'Tình nguyện hiến máu',detail:'Tham gia hoạt động hiến máu tình nguyện thông qua Hội Chữ thập đỏ TP. Thủ Đức theo hồ sơ CV trước đây.',meta:'CỘNG ĐỒNG'},{icon:'⌘',title:'Tham quan doanh nghiệp & hội thảo',detail:'Tham gia tham quan và sự kiện ngành logistics, gồm Lazada Việt Nam và cảng Cái Mép – Thị Vải.',meta:'HỌC HỎI NGÀNH'},{icon:'◉',title:'Khóa tiếng Trung tăng cường',detail:'Hoàn thành Mandarin Intensive Program – Mandarin Level 2 tại Đại học Nguyên Trí vào 12/2025.',meta:'NGOẠI NGỮ'}],
    certsHeading:'Chứng chỉ chuyên môn',certCount:'07 HỒ SƠ',certsCaption:'Các bài kiểm tra kỹ năng và chứng nhận hoàn thành khóa học đã được cung cấp.',certAll:'Tất cả',certHacker:'HackerRank',certDatacamp:'DataCamp',certLang:'Ngoại ngữ',certView:'XEM CHỨNG CHỈ ↗',certPrivate:'HỒ SƠ RIÊNG TƯ',certPrivacy:'Bản scan hoàn thành tiếng Trung có số cư trú nên không cho tải công khai. Không gọi chứng nhận hoàn thành khóa học là giấy phép hành nghề.',certKindAssessment:'BÀI THI KỸ NĂNG',certKindCourse:'HOÀN THÀNH KHÓA HỌC',
    certNames:{'hr-advanced':'SQL (Nâng cao)','hr-intermediate':'SQL (Trung cấp)','dc-powerbi':'Trực quan hóa dữ liệu bằng Power BI','dc-intermediate':'SQL trung cấp','dc-ai':'Làm sạch dữ liệu với AI tạo sinh','dc-intro':'Nhập môn SQL','mandarin':'Khóa tiếng Trung tăng cường – Level 2'},
    contactHeading:'Hãy kết nối',contactCaption:'Sẵn sàng trao đổi về phân tích dữ liệu, hoạt động logistics, dự án học tập và cơ hội nghề nghiệp phù hợp.',preferredContact:'LIÊN HỆ ƯU TIÊN',contactEmail:'Email',contactEmailSub:'Gửi email cho tôi',contactLinkedIn:'LinkedIn',contactLinkedInSub:'Hồ sơ nghề nghiệp',contactGithub:'GitHub',contactGithubSub:'Sẽ bổ sung đường dẫn',contactResume:'Hồ sơ CV',contactResumeSub:'Tải CV bản nháp',comingSoon:'SẮP CẬP NHẬT',footerNote:'Portfolio tĩnh đa ngôn ngữ · Một số thông tin chờ xác nhận',backToTop:'LÊN ĐẦU TRANG ↑'
  },
  'zh-Hant': {
    locale:'繁體中文',pageTitle:'范鴻孝 · Haven | 供應鏈 × 數據分析',
    navAbout:'關於我',navExperience:'工作經歷',navProjects:'作品專案',navStack:'流程與技能',navCommunity:'社群活動',navCerts:'專業證照',navContact:'聯絡方式',themeLight:'淺色',themeDark:'深色',
    heroBadge:'供應鏈 · 數據分析 · 商業智慧',heroEyebrow:'從實務營運走向數據洞察',heroGreeting:'你好，我是',heroName:'范鴻孝 · Haven',
    heroSummary:'結合物流與供應鏈實務經驗，以及 SQL、Power BI 與數據導向的決策能力。目前在臺灣元智大學攻讀 Global MBA。',heroLocation:'現居臺灣桃園',
    exploreWork:'探索我的專案',viewResume:'查看履歷（草稿）',copyEmail:'複製電子郵件',emailCopied:'已複製電子郵件地址！',copyFallback:'請複製電子郵件：',
    visualRole:'供應鏈 × 數據分析',visualInput:'營運',visualOutput:'洞察',floatRole:'供應鏈與物流',
    aboutHeading:'從營運實務走向數據分析',aboutStatement:'將實際供應鏈經驗轉化為商業分析能力。',aboutParagraph:'我的工作經驗涵蓋供應商協調、庫存追蹤、國際物流及 ERP 營運報表。目前在元智大學持續學習 SQL、Power BI 與企業管理，希望透過清楚、可執行的分析，協助改善複雜的營運問題。',talkAboutWork:'歡迎與我聯繫 ↗',
    statRoles:'工作經歷',statDegrees:'學位學程',statHackerrank:'HACKERRANK SQL 測驗',educationTitle:'教育背景',mbaDegree:'全球企業管理碩士（Global MBA）',mbaSchool:'元智大學 · 臺灣',mbaYears:'2025 年至今 · 就讀中',bachelorDegree:'物流與供應鏈管理學士',bachelorSchool:'胡志明市師範技術大學 · 越南',bachelorYears:'2020–2024 · GPA 8.46/10 · 優等',
    experienceHeading:'職涯發展與工作經驗',experienceCaption:'具備供應規劃、國際貨運承攬與進出口協調的實務經驗。',tabAll:'全部職務',tabPlanning:'供應規劃與 ERP',tabLogistics:'貨運與物流',dateNote:'備註：舊版中英文履歷中的 Kodai Sangyo 到職月份不一致；目前暫以年份呈現，待確認後更新。',
    experienceData:{
      'hoa-sen':{role:'供應鏈規劃專員',org:'Hoa Sen Group · 越南',summary:'透過 Oracle ERP 協調採購訂單、管理庫存並製作營運報表。',bullets:['追蹤國內及進口商品的供應商與採購訂單。','使用 Oracle ERP 管理庫存資料，並與倉庫及工廠合作。','製作營運報表，提升庫存及配送資訊的可視性。']},
      'kodai':{role:'物流業務專員',org:'Kodai Sangyo（越南）',summary:'協調國際貨運與客戶相關的貨運業務。',bullets:['製作運費報價，與船公司及海外代理聯繫。','協助冷鏈貨運排程、運輸文件及報關流程。','與文件及營運部門合作處理運輸問題。']},
      'vietlog':{role:'進出口實習生',org:'Viet Logistics · 越南',summary:'協助訂艙、運輸文件及報關相關作業。',bullets:['準備發票、裝箱單、原產地證明與運輸指示。','協助選擇承運商、安排訂艙及 HS Code 相關工作。','與營運團隊合作支援貨運承攬業務。']}
    },
    projectsHeading:'精選專案',projectsCaption:'依據目前進度展示課堂實作及個人作品專案。',projectDisclaimer:'資訊透明：每個專案均標註課堂作業、開發中或規劃中；不公開企業機密資料或尚未驗證的成果。',
    projAll:'全部',projAnalytics:'數據分析',projSql:'SQL',projSupply:'供應鏈',projDevelopment:'開發中',projStarter:'附入門範例',projConcept:'規劃中',projCoursework:'課堂作業 · 待審核',projectDetails:'查看詳情',dialogProblem:'目標',dialogMethods:'分析方法',dialogEvidence:'目前狀態',dialogClose:'關閉',projectData:{
      retail:{title:'零售業績分析儀表板',description:'以 Power BI 建立零售 KPI 與各門市績效儀表板。',goal:'分析營收、平均訂單金額、門市排名及線上訂單配送前置時間。',methods:'Power BI 視覺化、DAX 指標與互動式商業報表。',evidence:'根據課堂練習與開發中的儀表板；對外公開前仍須審核數據及截圖。'},
      sql:{title:'供應鏈 SQL 分析',description:'使用小型模擬訂單資料集進行可重現的 SQL 示範專案。',goal:'計算履約前置時間、延遲配送與訂單營運指標。',methods:'SQL JOIN、CASE、分組及視窗函數；壓縮檔內含 CSV 與 SQL 範例。',evidence:'使用模擬資料的入門範例，並非真實企業績效分析。'},
      inventory:{title:'庫存最佳化案例研究',description:'規劃探討庫存分類、補貨及缺貨風險。',goal:'研究 ABC 分類、庫存周轉與再訂購點情境。',methods:'規劃使用 Excel/Python 搭配公開或模擬資料。',evidence:'尚在規劃階段，完成後再新增成果及程式碼。'},
      netflix:{title:'Netflix 資料探索分析',description:'運用 Python 進行資料清理、探索與視覺化的課堂練習。',goal:'觀察節目類型及不同發行年份的內容分布。',methods:'pandas 資料清理、EDA 圖表及結果註解。',evidence:'既有學習作業；尚未公開完成審核的程式碼庫及分析成果。'}
    },
    stackHeading:'從數據走向決策',stackCaption:'點選不同流程，了解目前技能如何應用於營運分析。',stackWorkflow:'六階段流程',stackSkills:'技能矩陣',stageBadge:'選擇流程階段',toolkitTitle:'相關工具與實務',
    stages:[
      {number:'01',name:'資料來源',sub:'訂單、貨運與 ERP 記錄',desc:'從庫存、採購與物流流程中的實務問題及資料來源開始。',tools:['Oracle ERP','Excel','營運 KPI']},
      {number:'02',name:'資料清理',sub:'品質與一致性',desc:'報告前先標準化欄位、找出遺漏資料並記錄假設。',tools:['SQL','Excel','DataCamp 課程']},
      {number:'03',name:'SQL 分析',sub:'JOIN、彙總及邏輯處理',desc:'建立可重現的查詢，比較不同期間與分類的營運績效。',tools:['SQL 中高級測驗','CTE','視窗函數']},
      {number:'04',name:'BI 與報表',sub:'儀表板與資料視覺化',desc:'將結果呈現為易於理解、可深入檢視的決策儀表板。',tools:['Power BI','DAX 練習','資料敘事']},
      {number:'05',name:'供應鏈實務',sub:'規劃與營運脈絡',desc:'將分析連結至庫存流動、供應商績效與履約流程。',tools:['庫存管理','供應規劃','貨運承攬']},
      {number:'06',name:'決策支援',sub:'溝通與改善',desc:'向相關部門清楚說明發現、分析限制及建議。',tools:['KPI 報告','商業溝通','Global MBA']}
    ],
    skillsGroups:[{name:'數據分析與 BI',items:['SQL','Power BI','Excel','資料視覺化','資料清理','Python（學習中）']},{name:'供應鏈',items:['供應規劃','庫存管理','進出口','貨運承攬','採購協調']},{name:'企業系統',items:['Oracle ERP（工作經驗）','SAP Business One（接觸經驗）','Odoo（接觸經驗）']},{name:'商業能力',items:['營運報表','跨部門協作','英語 – TOEIC 840（舊履歷）','華語 – 元智大學 Level 2 課程結業']}],
    communityHeading:'學習與社群活動',communityCaption:'除了日常工作，也參與志工服務及產業相關學習。',communities:[{icon:'♡',title:'捐血志工',detail:'依據既有履歷，曾參加越南守德市紅十字會相關的志願捐血活動。',meta:'社群服務'},{icon:'⌘',title:'企業參訪與講座',detail:'參加物流產業活動與參訪，包括越南 Lazada 以及蓋梅—氏威港。',meta:'產業學習'},{icon:'◉',title:'華語密集學習',detail:'2025 年 12 月完成元智大學華語密集班 Mandarin Level 2 課程。',meta:'語言學習'}],
    certsHeading:'專業技能證明',certCount:'07 份文件',certsCaption:'展示已提供證明文件的技能測驗與課程結業紀錄。',certAll:'全部',certHacker:'HackerRank',certDatacamp:'DataCamp',certLang:'語言',certView:'查看證明 ↗',certPrivate:'私人紀錄',certPrivacy:'為保護個人隱私，含居留證號碼的華語課程證明掃描檔不提供公開下載。課程結業證明不等同專業執照。',certKindAssessment:'技能測驗',certKindCourse:'課程結業',
    certNames:{'hr-advanced':'SQL（進階）','hr-intermediate':'SQL（中級）','dc-powerbi':'Power BI 資料視覺化','dc-intermediate':'中級 SQL','dc-ai':'運用生成式 AI 清理資料','dc-intro':'SQL 入門','mandarin':'華語密集班 – Level 2'},
    contactHeading:'保持聯繫',contactCaption:'歡迎交流數據分析、物流營運、學習專案及相關職涯機會。',preferredContact:'建議聯絡方式',contactEmail:'電子郵件',contactEmailSub:'寄信給我',contactLinkedIn:'LinkedIn',contactLinkedInSub:'專業個人檔案',contactGithub:'GitHub',contactGithubSub:'個人檔案連結待新增',contactResume:'履歷',contactResumeSub:'下載履歷草稿',comingSoon:'即將新增',footerNote:'多語言靜態作品集 · 部分資料待確認',backToTop:'返回頂部 ↑'
  },
  'zh-Hans': {
    locale:'简体中文',pageTitle:'范鴻孝 · Haven | 供应链 × 数据分析',
    navAbout:'关于我',navExperience:'工作经历',navProjects:'项目作品',navStack:'流程与技能',navCommunity:'社区活动',navCerts:'专业证书',navContact:'联系方式',themeLight:'浅色',themeDark:'深色',
    heroBadge:'供应链 · 数据分析 · 商业智能',heroEyebrow:'从实际运营走向数据洞察',heroGreeting:'你好，我是',heroName:'范鴻孝 · Haven',
    heroSummary:'结合物流与供应链实务经验，以及 SQL、Power BI 与数据驱动的决策能力。目前在台湾元智大学攻读 Global MBA。',heroLocation:'现居台湾桃园',
    exploreWork:'浏览我的项目',viewResume:'查看简历（草稿）',copyEmail:'复制邮箱',emailCopied:'邮箱地址已复制！',copyFallback:'请复制邮箱地址：',
    visualRole:'供应链 × 数据分析',visualInput:'运营',visualOutput:'洞察',floatRole:'供应链与物流',
    aboutHeading:'从实际运营走向数据分析',aboutStatement:'将供应链实务经验运用于商业分析。',aboutParagraph:'我的工作经验涵盖供应商协调、库存跟踪、国际物流及 ERP 运营报表。目前在元智大学继续学习 SQL、Power BI 与企业管理，希望通过清晰、可执行的分析，帮助解决复杂的运营问题。',talkAboutWork:'欢迎与我联系 ↗',
    statRoles:'工作经历',statDegrees:'学位项目',statHackerrank:'HACKERRANK SQL 测试',educationTitle:'教育背景',mbaDegree:'全球工商管理硕士（Global MBA）',mbaSchool:'元智大学 · 台湾',mbaYears:'2025 年至今 · 在读',bachelorDegree:'物流与供应链管理学士',bachelorSchool:'胡志明市师范技术大学 · 越南',bachelorYears:'2020–2024 · GPA 8.46/10 · 优等',
    experienceHeading:'职业发展与工作经验',experienceCaption:'具有供应规划、国际货运代理及进出口协调的实际经验。',tabAll:'全部岗位',tabPlanning:'供应规划与 ERP',tabLogistics:'货运与物流',dateNote:'备注：旧版中英文简历中的 Kodai Sangyo 到职月份不一致；目前暂以年份呈现，待确认后更新。',
    experienceData:{
      'hoa-sen':{role:'供应链规划专员',org:'Hoa Sen Group · 越南',summary:'通过 Oracle ERP 协调采购订单、管理库存并制作运营报表。',bullets:['跟踪国内及进口商品的供应商与采购订单。','使用 Oracle ERP 管理库存数据，并与仓库及工厂合作。','制作运营报表，提升库存及配送信息的可视化。']},
      'kodai':{role:'物流销售专员',org:'Kodai Sangyo（越南）',summary:'协调国际货运与客户相关的货运业务。',bullets:['制作运费报价，与船公司及海外代理联络。','协助冷链货运排期、运输文件和报关流程。','与单证及运营团队合作处理运输问题。']},
      'vietlog':{role:'进出口实习生',org:'Viet Logistics · 越南',summary:'协助订舱、运输单证及报关相关工作。',bullets:['准备发票、装箱单、原产地证明与运输指示。','协助选择承运商、安排订舱及 HS Code 相关工作。','与运营团队协作支持国际货运代理业务。']}
    },
    projectsHeading:'精选项目',projectsCaption:'根据当前进度展示课程实践和个人作品项目。',projectDisclaimer:'信息透明：每个项目均标注为课程作业、开发中或规划中；不公开企业保密数据或尚未核实的成果。',
    projAll:'全部',projAnalytics:'数据分析',projSql:'SQL',projSupply:'供应链',projDevelopment:'开发中',projStarter:'含入门示例',projConcept:'规划中',projCoursework:'课程作业 · 待审核',projectDetails:'查看详情',dialogProblem:'目标',dialogMethods:'分析方法',dialogEvidence:'当前状态',dialogClose:'关闭',projectData:{
      retail:{title:'零售业绩分析仪表板',description:'使用 Power BI 建立零售 KPI 与各门店绩效仪表板。',goal:'分析营收、平均订单金额、门店排名及线上订单配送前置时间。',methods:'Power BI 可视化、DAX 指标与交互式商业报表。',evidence:'基于课程练习和开发中的仪表板；公开前仍须审核数据和截图。'},
      sql:{title:'供应链 SQL 分析',description:'使用小型模拟订单数据集的可复现 SQL 示例项目。',goal:'计算订单履约时间、延迟配送和运营指标。',methods:'SQL JOIN、CASE、分组和窗口函数；压缩包内含 CSV 与 SQL 示例。',evidence:'使用模拟数据的入门示例，并非真实企业绩效分析。'},
      inventory:{title:'库存优化案例研究',description:'规划研究库存分类、补货与缺货风险。',goal:'研究 ABC 分类、库存周转和再订货点情景。',methods:'计划使用 Excel/Python 与公开或模拟数据。',evidence:'项目尚处于规划阶段，完成后再添加成果和代码。'},
      netflix:{title:'Netflix 数据探索分析',description:'运用 Python 进行数据清理、探索与可视化的课程练习。',goal:'观察节目类型及不同发行年份的内容分布。',methods:'pandas 数据清理、EDA 图表及结果注释。',evidence:'已有学习练习；尚未公开完成审核的代码仓库和分析成果。'}
    },
    stackHeading:'从数据走向决策',stackCaption:'点击不同流程，了解当前技能如何应用于运营分析。',stackWorkflow:'六阶段流程',stackSkills:'技能矩阵',stageBadge:'选择流程阶段',toolkitTitle:'相关工具与实践',
    stages:[
      {number:'01',name:'数据来源',sub:'订单、货运与 ERP 记录',desc:'从库存、采购与物流过程中的实际问题及数据来源开始。',tools:['Oracle ERP','Excel','运营 KPI']},
      {number:'02',name:'数据清理',sub:'质量与一致性',desc:'生成报告之前先规范字段、查找缺失记录并记录假设。',tools:['SQL','Excel','DataCamp 课程']},
      {number:'03',name:'SQL 分析',sub:'JOIN、汇总及逻辑处理',desc:'建立可复现的查询，对比不同时间和类别的运营绩效。',tools:['SQL 中高级测试','CTE','窗口函数']},
      {number:'04',name:'BI 与报表',sub:'仪表板与数据可视化',desc:'将分析结果呈现为易于理解、可深入查看的决策仪表板。',tools:['Power BI','DAX 练习','数据叙事']},
      {number:'05',name:'供应链实务',sub:'规划与运营背景',desc:'将数据分析与库存流动、供应商绩效及履约流程联系起来。',tools:['库存管理','供应规划','货运代理']},
      {number:'06',name:'决策支持',sub:'沟通与改善',desc:'向相关部门清楚说明发现、分析限制和建议。',tools:['KPI 报告','商务沟通','Global MBA']}
    ],
    skillsGroups:[{name:'数据分析与 BI',items:['SQL','Power BI','Excel','数据可视化','数据清理','Python（学习中）']},{name:'供应链',items:['供应规划','库存管理','进出口','国际货运代理','采购协调']},{name:'企业系统',items:['Oracle ERP（工作经验）','SAP Business One（接触经验）','Odoo（接触经验）']},{name:'商业能力',items:['运营报表','跨部门协作','英语 – TOEIC 840（旧简历）','中文 – 元智大学 Level 2 课程结业']}],
    communityHeading:'学习与社区活动',communityCaption:'除日常工作外，还参与志愿服务和行业相关学习。',communities:[{icon:'♡',title:'无偿献血志愿者',detail:'据以往简历，曾参加越南守德市红十字会相关的无偿献血活动。',meta:'社区服务'},{icon:'⌘',title:'企业参访与讲座',detail:'参加物流行业活动与参访，包括越南 Lazada 及盖梅—氏威港。',meta:'行业学习'},{icon:'◉',title:'中文强化学习',detail:'于 2025 年 12 月完成元智大学 Mandarin Level 2 中文强化课程。',meta:'语言学习'}],
    certsHeading:'专业技能证明',certCount:'07 份材料',certsCaption:'展示已经提供证明材料的技能测试和课程结业记录。',certAll:'全部',certHacker:'HackerRank',certDatacamp:'DataCamp',certLang:'语言',certView:'查看证明 ↗',certPrivate:'私人记录',certPrivacy:'为保护隐私，含有居留证号码的中文课程扫描件不提供公开下载。课程结业证书不等同于专业执照。',certKindAssessment:'技能测试',certKindCourse:'课程结业',
    certNames:{'hr-advanced':'SQL（高级）','hr-intermediate':'SQL（中级）','dc-powerbi':'Power BI 数据可视化','dc-intermediate':'中级 SQL','dc-ai':'使用生成式 AI 清理数据','dc-intro':'SQL 入门','mandarin':'中文强化课程 – Level 2'},
    contactHeading:'保持联系',contactCaption:'欢迎交流数据分析、物流运营、学习项目与相关职业机会。',preferredContact:'首选联系方式',contactEmail:'邮箱',contactEmailSub:'向我发送邮件',contactLinkedIn:'LinkedIn',contactLinkedInSub:'职业个人主页',contactGithub:'GitHub',contactGithubSub:'待添加主页链接',contactResume:'个人简历',contactResumeSub:'下载简历草稿',comingSoon:'即将更新',footerNote:'多语言静态作品集 · 部分内容待确认',backToTop:'返回顶部 ↑'
  }
};
