import { useState, useEffect } from 'react';
import { serviceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';

export default function BrowseServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startConversation } = useChat();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data } = await serviceAPI.getActiveServices();
        setServices(data.services);
      } catch (err) {
        toast('Failed to load services', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleHire = async (serviceId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer for this service?')) return;
    try {
      setHiring(serviceId);
      await serviceAPI.hireService(serviceId);
      toast('Hired successfully! Redirecting to orders...', 'success');
      setTimeout(() => navigate('/freelancer/orders'), 1500);
    } catch (err) {
      toast('Failed to hire freelancer: ' + err.message, 'error');
    } finally {
      setHiring(null);
    }
  };

  const handleMessage = async (freelancerId) => {
    if (!freelancerId) return;
    try {
      const conversation = await startConversation(freelancerId);
      if (conversation) {
        navigate(`/messages/${conversation._id}`);
      }
    } catch (err) {
      toast('Failed to start conversation', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Freelancer Services</h1>
        <p className="text-surface-400">Discover and hire experts for your needs.</p>
      </div>

      {services.length === 0 ? (
        <div className="bg-surface-900 rounded-2xl p-12 text-center border border-surface-800">
          <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-xl text-white font-medium">No active services available right now.</p>
          <p className="text-surface-500 mt-1">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service._id} className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden hover:border-surface-700 transition-all hover:shadow-xl group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    {service.category || 'General'}
                  </span>
                  <p className="text-2xl font-bold text-white">${service.price}</p>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-surface-400 text-sm mb-6 line-clamp-3 h-15">
                  {service.description}
                </p>

                <div className="border-t border-surface-800 pt-4 flex flex-wrap items-center justify-between mt-auto gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-brand-500 border border-surface-700 overflow-hidden shrink-0">
                      {service.freelancer?.avatar ? (
                        <img src={service.freelancer.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold">{service.freelancer?.name?.[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{service.freelancer?.name}</p>
                      <p className="text-surface-500 text-xs truncate">Expert Developer</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 ml-auto sm:ml-0">
                    <button
                      onClick={() => handleMessage(service.freelancer?._id)}
                      className="bg-surface-800 hover:bg-surface-700 text-brand-400 font-bold py-2 px-3 rounded-xl transition-all border border-surface-700 active:scale-95 flex items-center justify-center shadow-lg"
                      title="Message Freelancer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleHire(service._id)}
                      disabled={hiring === service._id}
                      className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 whitespace-nowrap"
                    >
                      {hiring === service._id ? 'Hiring...' : 'Hire Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
