import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Download, Menu, X, Loader2, Lock } from 'lucide-react';
import { getSupabase } from './lib/supabase';
import * as XLSX from 'xlsx';

const IMAGES = {
  jagan: "https://lh3.googleusercontent.com/aida/ADBb0uj68bzdVnFbjRiwjGruilJB-S7Eki_uH2HYLmJjM3yEy6k7_ABb3rfaKI5-YOxSpEh-bXwTXtvhmvOqaGL_h0d8KlWYCtkaxJSdJ0HYCEF2rL7J1oSBbxf3MXO-Swy9mqGzPcTpZ18alRDY4GegGbVsYmZWs8CDPzZaO1oyiSOIuWNE31M1s8GG2Tzc2J21sFYYPlNbwsyWtkXbA1-s-E-XnLm4IIsTsu6Bx4ZfzSMETXu8Mrss5xtVYtbPWB5RC_MvOe0axKf2Gw",
  ysr: "https://lh3.googleusercontent.com/aida/ADBb0ug1PGMavkJRKyoUc3O4BO7Vpdrbo-RQgNsoR92b6SCUkk-2x32hmcYFs4rzoZP9DJFrBxMpVLDZDsyCYF76Bmks7jDipm6oWX39XFn23Q7EKdbdlmlx27V9E_UJVdU_Gz3cMe9UbbBmzc1ksu8Gtc1T-38zjlrGh02ibosL9AGzORA8iFTTav6Wz-f1DKRToNe4nGhlXIewj-6GmMapRxE6Ayi6OzV2hsqwMeA8668PK6Iw6ZASRxhLQ4_thXkqaLNxFi5IKrOZebw",
  emblem: "https://lh3.googleusercontent.com/aida/ADBb0ugvR8uSyZ3CDxH37uTGXUqGdNJXv3_JnhpEB-iiH-GGBlmwH8T3599M5n4vjN3uECVB0hgMxEOiQkeyOrIkjlg0tLTv3_b2JQRYRNLweB15jDiVAgqSL3ClnQoYsYTwamFpQbK1NfABLpIfGo0vzxATC_SkZMhya5-njiFWnUGQV164riC-6CYWZMNQKa-kMLoIWRNcdiwGNI_b6rie8-ZVTolnLMIBEPMn78BaS9SWBD299aC80SLv7sHfDvDOhCWSeuqiX3PaUOk",
  charan: "https://lh3.googleusercontent.com/aida/ADBb0uj18HM8F3YT_-XN21FwNV3zmteTeoQd2QLcJhMCblrGrh5HvUkGO2Hw5EhEflgQ0atojaCLgpFrvKPEcAwiqrlrr0KYx-IPFHJh6AVP_G0bUhp_T__NVRK6IqJ6y7Qe6MydwnyhZb90WSxhqD5cmxgVY7dJOLA2fGF3ELpVUvCiCxZQNVsEAYqP4zZK8kRcIPFj8FMPuZupytPO7bSY0fiZ0MSloEbRBx2timWOscjaDXCgTp6iEcXpICLz7xiCrtb2sCNqIEPty5w",
  usha: "https://lh3.googleusercontent.com/aida/ADBb0ugrMHpk10KykxqJPBnCJM0AtdAFeRSNLB8eDsm18N5XwR8yyk_gst8FosstJfM1mJJfsvg6EpdTVnJS-_KNJvEeFQt867ulBiXDrzSbSU6kVlRJx1zghzdf8Ivsr-inH3Ez4YNhRoTLdA7RPElU4dsyaRguyzo-mu9whfb6K65OZBufQ6CwHff2NWHqu5FKNfRKoLjwRiZzWDlaY6RNj81ib3MayfEWlW2avbOu2b51s7nkUAZc-jpmYSQoJFpmj-6Za4JxJnArpw"
};

export default function App() {
  const [view, setView] = useState<'home' | 'reports'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already_registered'>('idle');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    occupation: '',
    mandal: '',
    panchayat: '',
    consent: false
  });

  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [filters, setFilters] = useState({
    mandal: '',
    panchayat: ''
  });

  // Auth State for Reports
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'PkdUshaSreeYSJ@2029') {
      setIsAuthorized(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleDownloadXLSX = () => {
    if (reports.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(reports.map(r => ({
      'Name': r.name,
      'Phone Number': r.phonenumber,
      'Gender': r.gender,
      'Occupation': r.occupation,
      'Mandal': r.mandal,
      'Panchayat': r.panchayat
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    
    // Generate filename based on filters
    const filename = `YSRCP_IT_Wing_Report_${filters.mandal || 'All'}_${filters.panchayat || 'All'}_${new Date().toLocaleDateString()}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  useEffect(() => {
    if (view === 'reports') {
      fetchReports();
    }
  }, [view, filters]);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('ysrcppenugondaitwinglist')
        .select('*');
      
      if (filters.mandal) {
        query = query.eq('mandal', filters.mandal);
      }
      if (filters.panchayat) {
        query = query.ilike('panchayat', `%${filters.panchayat}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Phone number validation: must be exactly 10 digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Please enter a correct 10-digit phone number.');
      return;
    }

    if (!formData.consent) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const supabase = getSupabase();
      
      // Check if already registered
      const { data: existing, error: checkError } = await supabase
        .from('ysrcppenugondaitwinglist')
        .select('phonenumber')
        .eq('phonenumber', formData.phone)
        .maybeSingle();

      if (checkError) {
        console.error('Supabase check error:', checkError);
        throw checkError;
      }
      
      if (existing) {
        setSubmitStatus('already_registered');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('ysrcppenugondaitwinglist')
        .insert([
          {
            name: formData.name,
            phonenumber: formData.phone,
            gender: formData.gender,
            occupation: formData.occupation,
            mandal: formData.mandal,
            panchayat: formData.panchayat
          }
        ]);

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        phone: '',
        gender: '',
        occupation: '',
        mandal: '',
        panchayat: '',
        consent: false
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [dbConnectionStatus, setDbConnectionStatus] = useState<'testing' | 'connected' | 'failed' | 'idle'>('idle');

  const testConnection = async () => {
    setDbConnectionStatus('testing');
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('ysrcppenugondaitwinglist')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Database connection test error:', error);
        throw error;
      }
      setDbConnectionStatus('connected');
    } catch (error) {
      console.error('Database connection test failed:', error);
      setDbConnectionStatus('failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-body text-slate-900 selection:bg-secondary selection:text-white">
      {/* Navigation */}
      <header className="bg-primary py-3 md:py-4 px-4 md:px-8 border-b border-white/10 sticky top-0 z-[100] backdrop-blur-md bg-primary/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-base md:text-xl font-extrabold text-white uppercase tracking-[0.15em] md:tracking-[0.2em] font-headline">
            YSRCP IT WING
          </div>
          
          <nav className="hidden md:flex gap-8 items-center">
            <button 
              onClick={() => setView('home')}
              className={`font-headline font-bold text-white transition-all pb-1 border-b-2 ${view === 'home' ? 'border-white' : 'border-transparent'}`}
            >
              HOME
            </button>
            <button className="font-headline font-bold text-white/90 hover:text-white transition-colors">ABOUT</button>
            <button 
              onClick={() => {
                if (!isAuthorized) {
                  setView('reports');
                } else {
                  setView('reports');
                }
              }}
              className={`font-headline font-bold px-4 py-1.5 rounded transition-colors ${view === 'reports' ? 'bg-white text-primary' : 'bg-vibrant-green text-white hover:bg-vibrant-green/90'}`}
            >
              REPORTS
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-primary p-6 flex flex-col gap-4 md:hidden border-t border-white/10 shadow-2xl"
            >
              <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="text-white font-headline font-bold text-left">HOME</button>
              <button className="text-white font-headline font-bold text-left">ABOUT</button>
              <button onClick={() => { setView('reports'); setIsMenuOpen(false); }} className="text-white font-headline font-bold text-left">REPORTS</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Leadership Banner Section */}
        <section className="relative h-[40vh] sm:h-[45vh] md:h-[55vh] ysrcp-futuristic-gradient overflow-hidden">
          <div className="absolute inset-0 digital-grid pointer-events-none opacity-20"></div>
          <div className="w-full h-full flex items-end justify-between px-0 relative z-10">
            {/* Left: Jagan */}
            <div className="h-full w-[30%] sm:w-[33%] relative overflow-hidden flex flex-col justify-end">
              <img 
                src={IMAGES.jagan} 
                alt="Y.S. Jagan Mohan Reddy" 
                className="h-full w-full object-cover object-top scale-110 sm:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center px-1">
                <span className="text-white font-headline font-extrabold text-[6px] min-[400px]:text-[8px] sm:text-[10px] md:text-sm tracking-wider drop-shadow-md bg-primary/60 px-1.5 md:px-3 py-0.5 md:py-1 backdrop-blur-sm rounded-sm whitespace-nowrap">
                  Y.S. JAGAN MOHAN REDDY
                </span>
              </div>
            </div>

            {/* Center Branding */}
            <div className="flex-1 h-full flex items-center justify-center gap-1 sm:gap-4 md:gap-8 pb-4 sm:pb-10">
              <div className="block">
                <div className="w-8 h-8 min-[400px]:w-12 min-[400px]:h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-white overflow-hidden shadow-xl">
                  <img 
                    src={IMAGES.ysr} 
                    alt="Dr. YSR" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-1 md:space-y-4">
                <div className="w-12 h-12 min-[400px]:w-16 min-[400px]:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-full p-1.5 md:p-3 border-2 border-white/50 shadow-2xl">
                  <img src={IMAGES.emblem} alt="YSRCP Emblem" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-0 md:space-y-1">
                  <h1 className="text-[10px] min-[400px]:text-xs sm:text-lg md:text-2xl font-headline font-black text-white leading-tight tracking-tighter drop-shadow-lg whitespace-nowrap">
                    YSRCP <span className="text-white">IT WING</span>
                  </h1>
                  <h2 className="text-[6px] min-[400px]:text-[8px] sm:text-[10px] md:text-sm font-headline font-bold text-white/95 tracking-wide">
                    వైఎస్ఆర్ కాంగ్రెస్ పార్టీ ఐటీ వింగ్
                  </h2>
                </div>
                <div className="px-2 md:px-6 py-0.5 md:py-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white font-black tracking-[0.05em] md:tracking-[0.2em] text-[5px] min-[400px]:text-[7px] md:text-xs uppercase">
                  PENUGONDA CONSTITUENCY
                </div>
              </div>

              <div className="block">
                <div className="w-8 h-8 min-[400px]:w-12 min-[400px]:h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-white overflow-hidden shadow-xl">
                  <img 
                    src={IMAGES.charan} 
                    alt="Charan" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>
            </div>

            {/* Right: Usha Sri Charan */}
            <div className="h-full w-[30%] sm:w-[33%] relative overflow-hidden flex flex-col justify-end">
              <img 
                src={IMAGES.usha} 
                alt="Usha Sri Charan" 
                className="h-full w-full object-cover object-top scale-110 sm:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center px-1">
                <span className="text-white font-headline font-extrabold text-[6px] min-[400px]:text-[8px] sm:text-[10px] md:text-sm tracking-wider drop-shadow-md bg-primary/60 px-1.5 md:px-3 py-0.5 md:py-1 backdrop-blur-sm rounded-sm whitespace-nowrap">
                  USHA SRI CHARAN
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.section 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8 md:py-16 px-4 md:px-6 relative bg-white"
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
                  <span className="text-vibrant-green font-black tracking-[0.3em] uppercase text-[10px] md:text-xs">Digital Frontline</span>
                  <h2 className="text-2xl md:text-5xl font-headline font-black text-primary uppercase tracking-tighter">Join the Revolution</h2>
                  <div className="w-16 md:w-20 h-1 bg-deep-green mx-auto"></div>
                  
                  <p className="text-slate-500 max-w-2xl mx-auto font-medium text-base md:text-lg leading-relaxed">
                    Be a part of the Penugonda IT Wing. Your skills are the engine of our technological progress.
                  </p>
                </div>

                <div className="form-glass rounded-2xl md:rounded-3xl p-6 md:p-14 border border-slate-100">
                  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Name / పేరు</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter name"
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Phone Number / ఫోన్ నంబర్</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, phone: value });
                          }}
                          placeholder="Enter 10-digit number"
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold transition-all"
                        />
                      </div>
                      <div className="space-y-3 relative">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Gender / లింగం</label>
                        <select 
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold appearance-none cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <ChevronDown className="absolute right-0 bottom-4 text-slate-400 pointer-events-none" size={20} />
                      </div>
                      <div className="space-y-3 relative">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Occupation / వృత్తి</label>
                        <select 
                          required
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold appearance-none cursor-pointer"
                        >
                          <option value="">Select Option</option>
                          <option value="Software Professional">Software Professional</option>
                          <option value="Student">Student</option>
                          <option value="Business">Business</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-0 bottom-4 text-slate-400 pointer-events-none" size={20} />
                      </div>
                      <div className="space-y-3 relative">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Mandal / మండలం</label>
                        <select 
                          required
                          value={formData.mandal}
                          onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold appearance-none cursor-pointer"
                        >
                          <option value="">Select Mandal</option>
                          <option value="Penugonda">Penugonda</option>
                          <option value="Gorantla">Gorantla</option>
                          <option value="Somandepalli">Somandepalli</option>
                          <option value="Roddam">Roddam</option>
                          <option value="Parigi">Parigi</option>
                        </select>
                        <ChevronDown className="absolute right-0 bottom-4 text-slate-400 pointer-events-none" size={20} />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Panchayat / పంచాయితీ</label>
                        <input 
                          type="text" 
                          required
                          value={formData.panchayat}
                          onChange={(e) => setFormData({ ...formData, panchayat: e.target.value })}
                          placeholder="Enter Panchayat name"
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                      <div className="bg-primary/5 p-6 rounded-2xl border-l-4 border-deep-green text-sm text-slate-600 leading-relaxed italic">
                        "I hereby declare that I am a voluntary member of the YSRCP IT Wing and agree to the digital code of conduct."
                      </div>
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          id="consent"
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-1 w-6 h-6 rounded border-slate-300 text-deep-green focus:ring-deep-green cursor-pointer"
                        />
                        <label htmlFor="consent" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
                          I agree to the terms and conditions / నేను పై నిబంధనలను అంగీకరిస్తున్నాను
                        </label>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full green-glossy-btn py-5 md:py-6 text-white font-headline font-black text-lg md:text-xl uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Processing...
                          </>
                        ) : 'Complete Registration'}
                      </button>
                      
                      {submitStatus === 'success' && (
                        <p className="mt-4 text-center text-green-600 font-bold">Registration successful!</p>
                      )}
                      {submitStatus === 'already_registered' && (
                        <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center">
                          <p className="text-blue-700 font-headline font-black text-xl uppercase tracking-wider mb-2">Already Registered</p>
                          <p className="text-blue-600 font-medium">You are already a member of the YSRCP IT Wing. Thank you for your support!</p>
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <p className="mt-4 text-center text-red-600 font-bold">Error submitting registration. Please try again.</p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 md:py-16 px-6 relative bg-white min-h-[60vh] flex items-center"
            >
              <div className="max-w-5xl mx-auto w-full">
                {!isAuthorized ? (
                  <div className="max-w-md mx-auto">
                    <div className="form-glass rounded-3xl p-8 md:p-10 border border-slate-100 text-center space-y-6 shadow-xl">
                      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="text-primary" size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-headline font-black text-primary uppercase tracking-tighter">Restricted Access</h3>
                        <p className="text-slate-500 font-medium text-sm">Enter the secret key to access constituency reports and downloads.</p>
                      </div>
                      
                      <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="relative">
                          <input 
                            type="password"
                            value={passwordInput}
                            onChange={(e) => {
                              setPasswordInput(e.target.value);
                              if (passwordError) setPasswordError(false);
                            }}
                            placeholder="••••••••••••"
                            className={`w-full bg-slate-50 border-0 border-b-2 ${passwordError ? 'border-red-500' : 'border-slate-200'} focus:border-deep-green focus:ring-0 px-4 py-4 text-center text-xl font-bold tracking-[0.5em] transition-all`}
                          />
                          {passwordError && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2"
                            >
                              Invalid Secret Key
                            </motion.p>
                          )}
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-[0.2em] hover:bg-primary/95 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                          Unlock Reports
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-12 space-y-4">
                      <span className="text-vibrant-green font-black tracking-[0.3em] uppercase text-xs">Analytics Portal</span>
                      <h2 className="text-3xl md:text-5xl font-headline font-black text-primary uppercase tracking-tighter">Constituency Reports</h2>
                      <div className="w-20 h-1 bg-deep-green mx-auto"></div>
                      <p className="text-slate-500 max-w-2xl mx-auto font-medium text-base md:text-lg leading-relaxed">
                        Filter and download detailed reports for Mandal and Panchayat levels.
                      </p>
                    </div>

                    <div className="form-glass rounded-3xl p-6 md:p-10 border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-3 relative">
                          <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Mandal Name</label>
                          <select 
                            value={filters.mandal}
                            onChange={(e) => setFilters({ ...filters, mandal: e.target.value })}
                            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold appearance-none cursor-pointer"
                          >
                            <option value="">All Mandals</option>
                            <option value="Penugonda">Penugonda</option>
                            <option value="Gorantla">Gorantla</option>
                            <option value="Somandepalli">Somandepalli</option>
                            <option value="Roddam">Roddam</option>
                            <option value="Parigi">Parigi</option>
                          </select>
                          <ChevronDown className="absolute right-0 bottom-4 text-slate-400 pointer-events-none" size={20} />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Panchayat Name</label>
                          <input 
                            type="text" 
                            value={filters.panchayat}
                            onChange={(e) => setFilters({ ...filters, panchayat: e.target.value })}
                            placeholder="Search Panchayat"
                            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-deep-green focus:ring-0 px-0 py-3 text-lg font-semibold transition-all"
                          />
                        </div>

                        <button 
                          onClick={handleDownloadXLSX}
                          disabled={reports.length === 0}
                          className="green-glossy-btn py-4 text-white font-headline font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download size={20} />
                          Download Report
                        </button>
                      </div>

                      <div className="mt-12 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                        <div className="min-w-[600px]">
                          {isLoadingReports ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b-2 border-slate-100">
                                  <th className="py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest">Name</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest">Mandal</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest">Panchayat</th>
                                  <th className="py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest">Occupation</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reports.length > 0 ? reports.map((report, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 md:py-4 px-4 font-semibold text-slate-700 text-sm md:text-base">{report.name}</td>
                                    <td className="py-3 md:py-4 px-4 text-slate-600 text-sm md:text-base">{report.mandal}</td>
                                    <td className="py-3 md:py-4 px-4 text-slate-600 text-sm md:text-base">{report.panchayat}</td>
                                    <td className="py-3 md:py-4 px-4">
                                      <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] md:text-[10px] font-bold rounded-full uppercase">{report.occupation}</span>
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 italic">No records found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-center md:hidden">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">← Swipe to view more →</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-primary text-white py-8 md:py-12 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="space-y-3 md:space-y-4 text-center md:text-left">
            <div className="text-lg md:text-2xl font-black text-white tracking-[0.2em] font-headline">YSRCP IT WING</div>
            <p className="font-body text-[10px] md:text-sm text-white/50 tracking-wide max-w-xs mx-auto md:mx-0">
              © 2026 YSRCP IT Wing. Building the digital future of Andhra Pradesh.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <button className="text-[9px] md:text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest transition-colors">Privacy</button>
            <button className="text-[9px] md:text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest transition-colors">Terms</button>
            <button className="text-[9px] md:text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest transition-colors">Volunteer</button>
            <button className="text-[9px] md:text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest transition-colors">Media</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
