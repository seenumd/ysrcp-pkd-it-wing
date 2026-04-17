import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, 
  Check, 
  Lock, 
  X, 
  Download, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { supabase } from "./lib/supabase";

const LEADERS = {
  jagan: "https://lh3.googleusercontent.com/aida/ADBb0ujgtPhFcBPfP_lhVfyFs7aQ_GUrKRQEO2oPRNzmS0uOPCE-gTXDtLx2mTICxIY51jexTShpKToUQxizWw7uHGfk7id7SNpYgkIgj_2EaxjR7aVd1P26RXGYYimfONidRyYc-KGqoSFJGo6qlcqOyFoCwp4MvvcPGbNe9qODu0fj8Di4IhqhQyFPp4qLTehKE2ppFY-uJZ1D3uy59n8p7Lh4Z3ojFp4XFJgyne0wv_WMJh4BLmO9EEI83_Yr3y393HhX-XxiMyamB3Q",
  ysr: "https://lh3.googleusercontent.com/aida/ADBb0ujWMpSvkd3GxoKgpYCYufn8MRPGP4kydMwOczjAwDW7U2HNMgmaFrMMXvI7cayuz-LiqD0dRIDBqTpajclsFl8EaprBLTj4slXd2AgvG6qPHZ3meiRyZec76Vj7Gkm27maQ_5t_Oqg80_CTEEFBA8cUQz6S0bhPo9DlmhD8Xs7vXLAdZN7wQeIsNFtSN6eAPX1n9EIQ5pVELl8IGu-_Z73W8RYl8v4Y9RWxIcqnwQZYOt6Uh7agwLyVV5qK8KXsho-hjZsP4cV1d6E",
  emblem: "https://lh3.googleusercontent.com/aida/ADBb0uinP8O5kuSTV9ONPiroaPugemUXXi2ObLxA4Lmn7WaFCNEFJNLhfepTh9lDdVaH5vINfbp65elJMIfKsCIMJzLhiWz8WOGn3-4A6PZkx6ng_E_a6qchYPdJDTk9xLsKFmwEYAqueYxYS9K72HfiZbtOsdynFzMVpt52ZhMXvdBCjsJS2VkIKVhH2S6ssbglkzENya_iTagHeRv6h_3aNsx9XsPJ2XmcFLwX2u_EatRb4LtKdoYohoCPY5eD3SUix-YvJKQ4vHBTPHc",
  charan: "https://lh3.googleusercontent.com/aida/ADBb0ugOaNx6MkI07DFgnSdHzmXfYNEYD-j-yRmOdp36J_Xxw7Y0fDSuxoYegj4dFurgCVgJZo4B4ocleej56hx0fNcsj8U_gnMqAAUvEtt0gINcC5pR2IiovPPv582UdrduLLI9JGG0lBJrJVkS3YojILIuI8al7HifxPIk1MtUJQ_9R6krZYRUPHOjHGCGvlivy5VQwleMIGC31bJzO979MyoAfcg4MJysNKK0sCVPYoS3IBr5eJlI-pDCi9EjdUNYQgjzciyGJglY6A",
  usha: "https://lh3.googleusercontent.com/aida/ADBb0uijcR2BK19dQ1dQLsFXsc8Am18lm1P9rVbDM6J1Wmc0g01OCsXYdyJ99GZ89oTRKbmG_dv5eviYuKxRRfwqcnMaM6Q_Q-lU3SG7z8ApqUaDwRW7B-RDJpAfNdXJfGIuDlECpekvUwWKWD1rcQ8hpdHbz0TvlGMkNZbxQRa22js9ugiiwLGSfkTCdEwJqOFA-kWW9TCm9IeZ3cZOLCoX6E3uZb_-ANbF5pmZDbw-C1JA8oWeUnM-iBVfVNS9sS0m8s6s2V6LT4whKUE"
};

export default function App() {
  const [agreed, setAgreed] = useState(false);
  const [view, setView] = useState<'home' | 'reports'>('home');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [enteredKey, setEnteredKey] = useState("");
  const [error, setError] = useState("");

  // Registration Form State
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    occupation: '',
    mandal: '',
    panchayat: '',
    location: ''
  });

  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    mandal: '',
    panchayat: ''
  });

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      let query = supabase
        .from('ysrcppenugondaitwinglist')
        .select('*');
      
      if (reportFilters.mandal) {
        query = query.eq('mandal', reportFilters.mandal);
      }
      
      if (reportFilters.panchayat) {
        query = query.ilike('panchayat', `%${reportFilters.panchayat}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReports(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'reports') {
      fetchReports();
    }
  }, [view, reportFilters.mandal]);

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;
    
    const headers = ["name", "phonenumber", "gender", "occupation", "mandal", "panchayat", "location"];
    const displayHeaders = ["Name", "Phone", "Gender", "Occupation", "Mandal", "Panchayat", "Location"];
    
    const csvContent = [
      displayHeaders.join(","),
      ...reports.map(row => headers.map(header => `"${row[header] || ''}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `YSRCP_IT_WING_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistration = async () => {
    if (!agreed) {
      setError("Please agree to the terms.");
      return;
    }

    if (!formData.name || !formData.phone || !formData.mandal) {
      setError("Please fill in all required fields.");
      return;
    }

    setRegistrationStatus('loading');
    setError("");

    try {
      // 1. Check if already registered (by phone number)
      const { data: existingUser, error: checkError } = await supabase
        .from('ysrcppenugondaitwinglist')
        .select('phonenumber')
        .eq('phonenumber', formData.phone)
        .single();

      if (existingUser) {
        setRegistrationStatus('exists');
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw checkError;
      }

      // 2. Insert new record
      const { error: insertError } = await supabase
        .from('ysrcppenugondaitwinglist')
        .insert([{
          name: formData.name,
          phonenumber: formData.phone,
          gender: formData.gender,
          occupation: formData.occupation,
          mandal: formData.mandal,
          panchayat: formData.panchayat,
          location: formData.location
        }]);

      if (insertError) throw insertError;

      setRegistrationStatus('success');
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegistrationStatus('error');
      setError(err.message || "An error occurred during registration.");
    }
  };

  const handleReportsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (view === 'reports') {
      setView('home');
    } else {
      setShowSecretModal(true);
    }
  };

  const verifyKey = () => {
    const secret = import.meta.env.VITE_REPORTS_SECRET || "ITWING2024";
    if (enteredKey === secret) {
      setView('reports');
      setShowSecretModal(false);
      setEnteredKey("");
      setError("");
    } else {
      setError("Invalid Secret Key. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      {/* Header */}
      <header className="bg-primary py-4 px-6 md:px-12 sticky top-0 z-50 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg md:text-xl font-black text-white uppercase tracking-[0.2em] font-headline cursor-pointer"
            onClick={() => setView('home')}
          >
            YSRCP IT WING
          </motion.div>
          
          <nav className="flex gap-4 items-center">
            <div className="hidden md:flex gap-10 items-center">
              {['HOME', 'ABOUT'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (item === 'HOME') setView('home');
                  }}
                  className={`font-headline font-bold text-sm tracking-widest hover:text-white transition-colors ${ (item === 'HOME' && view === 'home') ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}
                >
                  {item}
                </a>
              ))}
            </div>
            <button 
              onClick={handleReportsClick}
              className={`font-headline font-bold px-4 py-2 md:px-5 md:py-2 rounded transition-all shadow-md text-[10px] md:text-xs tracking-widest whitespace-nowrap ${view === 'reports' ? 'bg-gold text-primary' : 'bg-secondary text-white hover:bg-deep-green'}`}
            >
              {view === 'reports' ? 'BACK TO HOME' : 'REPORTS'}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col"
            >
              {/* Hero Section */}
              <section className="relative h-[50vh] min-h-[320px] md:min-h-[400px] ysrcp-gradient animate-gradient-flow overflow-hidden flex items-end">
                <div className="absolute inset-0 digital-grid opacity-20" />
                
                <div className="w-full flex h-full items-end">
                  {/* Left Leader (Full Sidebar) */}
                  <div className="flex-1 relative h-full flex flex-col justify-end overflow-hidden group">
                    <img 
                      src={LEADERS.jagan} 
                      alt="Y.S. Jagan Mohan Reddy" 
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90 group-hover:brightness-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 pb-4 md:pb-8 text-center bg-gradient-to-t from-primary/60 to-transparent pt-12 md:pt-20">
                      <span className="text-[7px] md:text-xs text-white font-headline font-black tracking-[0.2em] px-2 md:px-4 py-1 md:py-1.5 bg-primary/40 backdrop-blur-md rounded uppercase whitespace-nowrap">
                        Y.S. Jagan
                      </span>
                    </div>
                  </div>

                  {/* Center Brand */}
                  <div className="flex-[1.2] relative h-full z-20 flex flex-col items-center justify-center gap-2 md:gap-8 px-2 md:px-4">
                    <div className="flex items-center justify-center gap-2 md:gap-8">
                      {/* Left Circular Leader */}
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-10 h-10 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-white shadow-2xl overflow-hidden shrink-0"
                      >
                        <img src={LEADERS.ysr} alt="YS Rajasekhara Reddy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </motion.div>

                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="w-10 h-10 md:w-28 md:h-28 rounded-full border border-white/50 p-1 md:p-2 shadow-2xl bg-white/10 backdrop-blur-md mb-1 md:mb-4"
                        >
                          <img src={LEADERS.emblem} alt="YSRCP Emblem" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </motion.div>
                        <motion.h1 
                          className="text-[10px] md:text-4xl font-headline font-black text-white tracking-tighter drop-shadow-lg mb-0.5 uppercase leading-none"
                        >
                          YSRCP IT WING
                        </motion.h1>
                        <motion.p 
                          className="text-[7px] md:text-sm font-bold text-white/90 mb-1 md:mb-4 font-headline uppercase"
                        >
                          IT WING
                        </motion.p>
                        <motion.div 
                          className="px-2 md:px-6 py-0.5 md:py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black tracking-[0.1em] md:tracking-[0.2em] text-[5px] md:text-[10px] uppercase whitespace-nowrap"
                        >
                          PENUGONDA
                        </motion.div>
                      </div>

                      {/* Right Circular Leader */}
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-10 h-10 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-white shadow-2xl overflow-hidden shrink-0"
                      >
                        <img src={LEADERS.charan} alt="Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Leader (Full Sidebar) */}
                  <div className="flex-1 relative h-full flex flex-col justify-end overflow-hidden group">
                    <img 
                      src={LEADERS.usha} 
                      alt="K.v. ushasri charan" 
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90 group-hover:brightness-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 pb-4 md:pb-8 text-center bg-gradient-to-t from-primary/60 to-transparent pt-12 md:pt-20">
                      <span className="text-[7px] md:text-xs text-white font-headline font-black tracking-[0.2em] px-2 md:px-4 py-1 md:py-1.5 bg-primary/40 backdrop-blur-md rounded uppercase whitespace-nowrap">
                        K.v. ushasri
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Registration Section */}
              <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-16 space-y-4">
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="text-secondary font-black tracking-[0.4em] uppercase text-[10px]"
                    >
                      Digital Frontline
                    </motion.span>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-6xl font-headline font-black text-primary uppercase tracking-tighter"
                    >
                      Join the Revolution
                    </motion.h2>
                    <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full" />
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-slate-500 max-w-2xl mx-auto font-medium text-lg"
                    >
                      Be a part of the Penugonda IT Wing. Your skills are the engine of our technological progress.
                    </motion.p>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-16"
                  >
                    {registrationStatus === 'success' || registrationStatus === 'exists' ? (
                      <div className="text-center space-y-8 py-10">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${registrationStatus === 'exists' ? 'bg-amber-100 text-amber-500' : 'bg-secondary/10 text-secondary'}`}>
                          {registrationStatus === 'exists' ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-headline font-black text-primary uppercase">
                            {registrationStatus === 'exists' ? 'ALREADY REGISTERED' : 'REGISTRATION COMPLETE'}
                          </h3>
                          <p className="text-slate-600 text-lg font-medium">
                            {registrationStatus === 'exists' 
                              ? "You have already registered your information. Thank you for your support!" 
                              : "Success! You are now part of the YSRCP IT Wing digital frontline. Thank you!"}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setRegistrationStatus('idle');
                            setFormData({
                              name: '',
                              phone: '',
                              gender: '',
                              occupation: '',
                              mandal: '',
                              panchayat: '',
                              location: ''
                            });
                            setAgreed(false);
                          }}
                          className="px-10 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Register Another
                        </button>
                      </div>
                    ) : (
                      <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); handleRegistration(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                          {/* Row 1 */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">NAME / పేరు</label>
                            <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter name"
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none transition-colors"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">PHONE NUMBER / ఫోన్ నంబర్</label>
                            <input 
                              type="tel" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit number"
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none transition-colors"
                              required
                            />
                          </div>

                          {/* Row 2 */}
                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">GENDER / లింగం</label>
                            <select 
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none appearance-none transition-colors"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-0 bottom-4 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">OCCUPATION / వృత్తి</label>
                            <select 
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none appearance-none transition-colors"
                            >
                              <option value="">Select Option</option>
                              <option value="Software Professional" >Software Professional</option>
                              <option value="Student">Student</option>
                              <option value="Business">Business</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-0 bottom-4 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Row 3 */}
                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">MANDAL / మండలం</label>
                            <select 
                              name="mandal"
                              value={formData.mandal}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none appearance-none transition-colors"
                              required
                            >
                              <option value="">Select Mandal</option>
                              <option value="Penugonda">Penugonda</option>
                              <option value="Gorantla">Gorantla</option>
                              <option value="Somandepalli">Somandepalli</option>
                              <option value="Parigi">Parigi</option>
                              <option value="Roddam">Roddam</option>
                            </select>
                            <ChevronDown className="absolute right-0 bottom-4 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">PANCHAYAT / పంచాయితీ</label>
                            <input 
                              type="text" 
                              name="panchayat"
                              value={formData.panchayat}
                              onChange={handleInputChange}
                              placeholder="Enter Panchayat name"
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Row 4 */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">PRESENT LOCATION / ప్రస్తుతం ఉన్న ప్రదేశం</label>
                            <input 
                              type="text" 
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="your working location"
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-semibold focus:border-secondary focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-slate-100">
                          <div className="bg-primary/5 p-8 rounded-3xl border-l-4 border-secondary">
                            <p className="text-slate-600 font-medium italic leading-relaxed">
                              "I hereby declare that I am a voluntary member of the YSRCP IT Wing and agree to the digital code of conduct."
                            </p>
                          </div>

                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div 
                              onClick={() => setAgreed(!agreed)}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${agreed ? 'bg-secondary border-secondary' : 'border-slate-300 group-hover:border-secondary shadow-inner'}`}
                            >
                              {agreed && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-sm font-bold text-slate-500 select-none">
                              I agree to the terms and conditions / నేను పై నిబంధనలను అంగీకరిస్తున్నాను
                            </span>
                          </label>
                        </div>

                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-red-50 text-red-500 rounded-xl text-center font-bold text-sm uppercase tracking-widest"
                          >
                            {error}
                          </motion.div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02, brightness: 1.1 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={registrationStatus === 'loading'}
                          className={`w-full glossy-button py-6 rounded-2xl text-white font-headline font-black text-xl uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 ${registrationStatus === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {registrationStatus === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
                          {registrationStatus === 'loading' ? 'Processing...' : 'Complete Registration'}
                        </motion.button>
                      </form>
                    )}
                  </motion.div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col"
            >
              {/* Reports Hero Section */}
              <section className="relative h-[35vh] min-h-[300px] ysrcp-gradient animate-gradient-flow overflow-hidden flex items-end">
                <div className="absolute inset-0 digital-grid opacity-20" />
                <div className="w-full flex h-full items-end">
                  {/* Left Leader */}
                  <div className="flex-1 relative h-full flex flex-col justify-end overflow-hidden group">
                    <img 
                      src={LEADERS.jagan} 
                      alt="Y.S. Jagan Mohan Reddy" 
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90 group-hover:brightness-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 pb-4 md:pb-6 text-center bg-gradient-to-t from-primary/60 to-transparent pt-12">
                      <span className="text-[7px] md:text-[10px] text-white font-headline font-black tracking-[0.2em] px-2 md:px-3 py-0.5 md:py-1 bg-primary/40 backdrop-blur-md rounded uppercase whitespace-nowrap">
                        Y.S. Jagan
                      </span>
                    </div>
                  </div>

                  {/* Center Brand */}
                  <div className="flex-[1.2] relative h-full z-20 flex flex-col items-center justify-center gap-2 md:gap-6 px-2 md:px-4">
                    <div className="flex items-center justify-center gap-2 md:gap-6">
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-8 h-8 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-white shadow-2xl overflow-hidden shrink-0"
                      >
                        <img src={LEADERS.ysr} alt="YS Rajasekhara Reddy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </motion.div>

                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          className="w-8 h-8 md:w-20 md:h-20 rounded-full border border-white/50 p-1 md:p-2 shadow-2xl bg-white/10 backdrop-blur-md mb-1"
                        >
                          <img src={LEADERS.emblem} alt="YSRCP Emblem" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </motion.div>
                        <motion.h1 
                          className="text-[9px] md:text-2xl font-headline font-black text-white tracking-tighter drop-shadow-lg uppercase leading-none"
                        >
                          YSRCP IT WING
                        </motion.h1>
                        <motion.p 
                          className="text-[6px] md:text-xs font-bold text-white/90 mb-1 font-headline uppercase"
                        >
                          IT WING
                        </motion.p>
                      </div>

                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-8 h-8 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-white shadow-2xl overflow-hidden shrink-0"
                      >
                        <img src={LEADERS.charan} alt="Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Leader */}
                  <div className="flex-1 relative h-full flex flex-col justify-end overflow-hidden group">
                    <img 
                      src={LEADERS.usha} 
                      alt="K.v. ushasri charan" 
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90 group-hover:brightness-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 pb-4 md:pb-6 text-center bg-gradient-to-t from-primary/60 to-transparent pt-12">
                      <span className="text-[7px] md:text-[10px] text-white font-headline font-black tracking-[0.2em] px-2 md:px-3 py-0.5 md:py-1 bg-primary/40 backdrop-blur-md rounded uppercase whitespace-nowrap">
                        K.v. ushasri
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reports Content */}
              <section className="py-16 px-6 bg-white flex-grow">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16 space-y-2">
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-secondary font-black tracking-[0.3em] uppercase text-[11px]"
                    >
                      ANALYTICS PORTAL
                    </motion.span>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-6xl font-headline font-black text-primary uppercase tracking-tight"
                    >
                      CONSTITUENCY REPORTS
                    </motion.h2>
                    <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-slate-500 max-w-2xl mx-auto font-medium text-lg pt-4"
                    >
                      Filter and download detailed reports for Mandal and Panchayat levels.
                    </motion.p>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
                  >
                    {/* Filters Bar */}
                    <div className="p-8 md:p-12 border-b border-slate-50 bg-white">
                      <div className="flex flex-col lg:flex-row items-end gap-8">
                        <div className="flex-1 w-full space-y-3">
                          <label className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">Mandal Name</label>
                          <div className="relative">
                            <select 
                              value={reportFilters.mandal}
                              onChange={(e) => setReportFilters(prev => ({ ...prev, mandal: e.target.value }))}
                              className="w-full bg-slate-50 border-b-2 border-slate-200 py-4 px-6 text-lg font-bold text-slate-700 focus:border-secondary focus:outline-none appearance-none transition-all rounded-t-xl"
                            >
                              <option value="">All Mandals</option>
                              <option value="Penugonda">Penugonda</option>
                              <option value="Gorantla">Gorantla</option>
                              <option value="Somandepalli">Somandepalli</option>
                              <option value="Parigi">Parigi</option>
                              <option value="Roddam">Roddam</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                          <label className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">Panchayat Name</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Search Panchayat"
                              value={reportFilters.panchayat}
                              onChange={(e) => setReportFilters(prev => ({ ...prev, panchayat: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
                              className="w-full bg-slate-50 border-b-2 border-slate-200 py-4 px-12 text-lg font-bold text-slate-700 focus:border-secondary focus:outline-none transition-all rounded-t-xl"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                          <button 
                            onClick={fetchReports}
                            className="glossy-button bg-primary py-4 px-8 rounded-2xl text-white font-black flex items-center justify-center gap-3 text-xs tracking-widest uppercase shadow-xl hover:scale-105 transition-all"
                          >
                            <Search className="w-5 h-5" />
                            Search
                          </button>
                          <button 
                            onClick={handleDownloadCSV}
                            disabled={reports.length === 0}
                            className={`glossy-button bg-secondary py-4 px-8 rounded-2xl text-white font-black flex items-center justify-center gap-3 text-xs tracking-widest uppercase shadow-xl hover:scale-105 transition-all ${reports.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                      {reportsLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                          <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Decrypting Records...</p>
                        </div>
                      ) : reports.length > 0 ? (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-12 py-8 text-[11px] font-black text-primary uppercase tracking-widest">Name</th>
                              <th className="px-12 py-8 text-[11px] font-black text-primary uppercase tracking-widest">Phone</th>
                              <th className="px-12 py-8 text-[11px] font-black text-primary uppercase tracking-widest">Mandal</th>
                              <th className="px-12 py-8 text-[11px] font-black text-primary uppercase tracking-widest">Panchayat</th>
                              <th className="px-12 py-8 text-[11px] font-black text-primary uppercase tracking-widest">Occupation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reports.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-12 py-8">
                                  <span className="text-xl font-bold text-slate-800 leading-tight block truncate max-w-xs">{row.name}</span>
                                </td>
                                <td className="px-12 py-8">
                                  <span className="text-slate-500 font-mono font-bold text-sm">{row.phonenumber}</span>
                                </td>
                                <td className="px-12 py-8">
                                  <span className="text-slate-500 font-bold text-sm">{row.mandal}</span>
                                </td>
                                <td className="px-12 py-8">
                                  <span className="text-slate-500 font-bold text-sm tracking-tight">{row.panchayat}</span>
                                </td>
                                <td className="px-12 py-8">
                                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap">
                                    {row.occupation}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Search className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-slate-800 font-black text-xl uppercase tracking-tight">No Records Found</p>
                                <p className="text-slate-400 font-medium text-sm">Try adjusting your filters to find members.</p>
                            </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Secret Key Modal */}
      <AnimatePresence>
        {showSecretModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 ysrcp-gradient" />
              <button 
                onClick={() => {
                  setShowSecretModal(false);
                  setError("");
                  setEnteredKey("");
                }}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 pt-4">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-black text-primary uppercase tracking-tight">ACCESS RESTRICTED</h3>
                <p className="text-slate-500 font-medium text-sm">This section is for authorized administrative members only. Please enter the IT Wing Secret Key.</p>
              </div>

              <div className="mt-10 space-y-6">
                <div className="space-y-2">
                  <input 
                    type="password" 
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    placeholder="Enter Secret Key"
                    className={`w-full bg-slate-50 border-2 ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 px-6 text-center text-lg font-bold tracking-widest focus:border-primary focus:outline-none transition-all placeholder:tracking-normal placeholder:font-medium`}
                    onKeyDown={(e) => e.key === 'Enter' && verifyKey()}
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
                </div>
                <button 
                  onClick={verifyKey}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-headline font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  DECRYPT & ACCESS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12 md:py-20 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black tracking-[0.3em] font-headline uppercase">YSRCP IT WING</h3>
            <p className="text-white/40 font-medium text-[10px] md:text-sm leading-relaxed max-w-sm">
              © 2024 YSRCP IT Wing. Building the digital future of Andhra Pradesh through innovation and grassroots empowerment.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-14 leading-none">
            {['PRIVACY', 'TERMS', 'VOLUNTEER', 'MEDIA'].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-[9px] md:text-xs font-black text-white/50 hover:text-gold transition-colors tracking-widest"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
