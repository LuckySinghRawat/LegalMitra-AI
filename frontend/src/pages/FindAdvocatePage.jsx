import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import { lawyersAPI } from '../api/axios';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/constants';
import {
  Search, MapPin, Star, Phone, Mail, Award, Clock, Filter,
  Navigation, Shield, Users, ChevronDown, ChevronUp, Scale,
  Briefcase, Globe, IndianRupee, Loader2, AlertCircle, Sparkles,
  MapPinned, BadgeCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const FindAdvocatePage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Search params
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [issueText, setIssueText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [radius, setRadius] = useState(50);
  const [sortBy, setSortBy] = useState('relevance');

  // Results meta
  const [resultMeta, setResultMeta] = useState(null);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // Try reverse geocode for display label
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          const data = await resp.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          setLocationLabel(city && state ? `${city}, ${state}` : city || state || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
        toast.success('Location detected!');
      },
      (error) => {
        setLocating(false);
        let msg = 'Could not get your location';
        if (error.code === 1) msg = 'Location access denied. Please allow location access.';
        else if (error.code === 2) msg = 'Location unavailable. Please try again.';
        else if (error.code === 3) msg = 'Location request timed out.';
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto-detect category when issue text changes (debounced)
  useEffect(() => {
    if (!issueText || issueText.length < 10) {
      setDetectedCategory('');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await lawyersAPI.detectCategory(issueText);
        if (res.data.success && res.data.category !== 'Other') {
          setDetectedCategory(res.data.category);
        } else {
          setDetectedCategory('');
        }
      } catch {
        // Silently fail - category detection is optional
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [issueText]);

  // Static lawyer profiles data
  const STATIC_LAWYERS = [
    { _id: 's1', name: 'Advocate Rajesh Sharma', specialization: 'Criminal Law', experience: 15, rating: 4.7, reviewCount: 128, contact: { phone: '98XXXX1001', email: 'rajesh.sharma@advocate.in' }, barCouncilId: 'DL/1234/2010', location: { city: 'New Delhi', state: 'Delhi', address: 'Patiala House Courts, New Delhi' }, languages: ['English', 'Hindi'], availability: 'available', consultationFee: 2000, categories: ['Criminal'], isVerified: true, distanceText: '3.2 km', distance: 3.2 },
    { _id: 's2', name: 'Advocate Priya Mehta', specialization: 'Family Law', experience: 10, rating: 4.8, reviewCount: 95, contact: { phone: '98XXXX1002', email: 'priya.mehta@advocate.in' }, barCouncilId: 'DL/2345/2013', location: { city: 'New Delhi', state: 'Delhi', address: 'Saket District Court, New Delhi' }, languages: ['English', 'Hindi'], availability: 'available', consultationFee: 1500, categories: ['Family'], isVerified: true, distanceText: '5.8 km', distance: 5.8 },
    { _id: 's3', name: 'Advocate Vikram Singh', specialization: 'Cyber Law', experience: 8, rating: 4.5, reviewCount: 67, contact: { phone: '98XXXX1003', email: 'vikram.singh@advocate.in' }, barCouncilId: 'DL/3456/2015', location: { city: 'Noida', state: 'Uttar Pradesh', address: 'Sector 62, Noida' }, languages: ['English', 'Hindi'], availability: 'available', consultationFee: 1800, categories: ['Cyber', 'Criminal'], isVerified: true, distanceText: '12.4 km', distance: 12.4 },
    { _id: 's4', name: 'Advocate Neha Gupta', specialization: 'Consumer Law', experience: 12, rating: 4.6, reviewCount: 150, contact: { phone: '98XXXX1004', email: 'neha.gupta@advocate.in' }, barCouncilId: 'DL/4567/2011', location: { city: 'Gurugram', state: 'Haryana', address: 'DLF Cyber City, Gurugram' }, languages: ['English', 'Hindi', 'Punjabi'], availability: 'available', consultationFee: 2500, categories: ['Consumer', 'Financial'], isVerified: true, distanceText: '18.1 km', distance: 18.1 },
    { _id: 's5', name: 'Advocate Arun Tiwari', specialization: 'Property Law', experience: 20, rating: 4.9, reviewCount: 210, contact: { phone: '98XXXX1005', email: 'arun.tiwari@advocate.in' }, barCouncilId: 'DL/5678/2004', location: { city: 'New Delhi', state: 'Delhi', address: 'Tis Hazari Courts, New Delhi' }, languages: ['English', 'Hindi'], availability: 'available', consultationFee: 3000, categories: ['Property'], isVerified: true, distanceText: '7.6 km', distance: 7.6 },
    { _id: 's6', name: 'Advocate Sneha Desai', specialization: 'Corporate Law', experience: 14, rating: 4.7, reviewCount: 89, contact: { phone: '98XXXX2001', email: 'sneha.desai@advocate.in' }, barCouncilId: 'MH/1234/2009', location: { city: 'Mumbai', state: 'Maharashtra', address: 'Bombay High Court, Fort, Mumbai' }, languages: ['English', 'Hindi', 'Marathi'], availability: 'available', consultationFee: 3500, categories: ['Financial', 'Consumer'], isVerified: true, distanceText: '22.3 km', distance: 22.3 },
    { _id: 's7', name: 'Advocate Rohan Patil', specialization: 'Labor Law', experience: 11, rating: 4.4, reviewCount: 73, contact: { phone: '98XXXX2002', email: 'rohan.patil@advocate.in' }, barCouncilId: 'MH/2345/2012', location: { city: 'Mumbai', state: 'Maharashtra', address: 'Andheri Court, Mumbai' }, languages: ['English', 'Hindi', 'Marathi'], availability: 'available', consultationFee: 2000, categories: ['Labor'], isVerified: true, distanceText: '25.0 km', distance: 25.0 },
    { _id: 's8', name: 'Advocate Karthik Reddy', specialization: 'Cyber Law', experience: 9, rating: 4.6, reviewCount: 82, contact: { phone: '98XXXX3001', email: 'karthik.reddy@advocate.in' }, barCouncilId: 'KA/1234/2014', location: { city: 'Bengaluru', state: 'Karnataka', address: 'Koramangala, Bengaluru' }, languages: ['English', 'Hindi', 'Kannada', 'Telugu'], availability: 'available', consultationFee: 2000, categories: ['Cyber', 'Criminal'], isVerified: true, distanceText: '15.7 km', distance: 15.7 },
    { _id: 's9', name: 'Advocate Suresh Kumar', specialization: 'Consumer Law', experience: 16, rating: 4.7, reviewCount: 134, contact: { phone: '98XXXX4001', email: 'suresh.kumar@advocate.in' }, barCouncilId: 'TN/1234/2008', location: { city: 'Chennai', state: 'Tamil Nadu', address: 'Madras High Court, Chennai' }, languages: ['English', 'Hindi', 'Tamil'], availability: 'available', consultationFee: 1500, categories: ['Consumer', 'Financial'], isVerified: true, distanceText: '30.2 km', distance: 30.2 },
    { _id: 's10', name: 'Advocate Sanjay Verma', specialization: 'Criminal Law', experience: 19, rating: 4.8, reviewCount: 175, contact: { phone: '98XXXX8001', email: 'sanjay.verma@advocate.in' }, barCouncilId: 'UP/1234/2005', location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Allahabad High Court Bench, Lucknow' }, languages: ['English', 'Hindi', 'Urdu'], availability: 'available', consultationFee: 2000, categories: ['Criminal'], isVerified: true, distanceText: '8.5 km', distance: 8.5 },
    { _id: 's11', name: 'Advocate Gurpreet Kaur', specialization: 'Family Law', experience: 11, rating: 4.5, reviewCount: 84, contact: { phone: '98XXXX0001', email: 'gurpreet.kaur@advocate.in' }, barCouncilId: 'CH/1234/2012', location: { city: 'Chandigarh', state: 'Chandigarh', address: 'Punjab & Haryana High Court' }, languages: ['English', 'Hindi', 'Punjabi'], availability: 'available', consultationFee: 1500, categories: ['Family'], isVerified: true, distanceText: '10.0 km', distance: 10.0 },
    { _id: 's12', name: 'Advocate Amit Banerjee', specialization: 'Constitutional Law', experience: 22, rating: 4.9, reviewCount: 230, contact: { phone: '98XXXX5001', email: 'amit.banerjee@advocate.in' }, barCouncilId: 'WB/1234/2002', location: { city: 'Kolkata', state: 'West Bengal', address: 'Calcutta High Court, Kolkata' }, languages: ['English', 'Hindi', 'Bengali'], availability: 'available', consultationFee: 3000, categories: ['Criminal', 'Government'], isVerified: true, distanceText: '14.9 km', distance: 14.9 },
  ];

  const searchLawyers = useCallback(() => {
    setLoading(true);
    setSearched(true);

    // Simulate brief loading for UX
    setTimeout(() => {
      let results = [...STATIC_LAWYERS];
      const category = selectedCategory || detectedCategory || '';

      // Filter by category if selected
      if (category && category !== 'Other') {
        results = results.filter(l => l.categories.includes(category));
      }

      // Client-side sort
      if (sortBy === 'distance') {
        results.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'experience') {
        results.sort((a, b) => b.experience - a.experience);
      } else if (sortBy === 'fee-low') {
        results.sort((a, b) => a.consultationFee - b.consultationFee);
      } else {
        // relevance: verified first, then rating, then distance
        results.sort((a, b) => {
          if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
          return b.rating - a.rating || a.distance - b.distance;
        });
      }

      setLawyers(results);
      setResultMeta({
        category: category || 'All',
        detectedFromText: !!detectedCategory && !selectedCategory,
        total: results.length,
        radius,
      });
      setLoading(false);
    }, 500);
  }, [selectedCategory, detectedCategory, radius, sortBy]);

  // Re-sort when sortBy changes (client side)
  useEffect(() => {
    if (lawyers.length === 0) return;
    const sorted = [...lawyers];
    if (sortBy === 'distance') {
      sorted.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      sorted.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'fee-low') {
      sorted.sort((a, b) => a.consultationFee - b.consultationFee);
    } else {
      sorted.sort((a, b) => {
        if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
        return b.rating - a.rating || a.distance - b.distance;
      });
    }
    setLawyers(sorted);
  }, [sortBy]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
          color={i <= Math.round(rating) ? '#f59e0b' : '#475569'}
          style={{ display: 'inline' }}
        />
      );
    }
    return stars;
  };

  const activeCategory = selectedCategory || detectedCategory;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scale size={22} color="white" />
            </div>
            <span className="gradient-text">Smart Advocate Finder</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginLeft: '56px' }}>
            Find verified lawyers near you based on your complaint type
          </p>
        </div>

        {/* Search Panel */}
        <div className="glass-card" style={{ marginBottom: '24px', padding: '28px', animation: 'fadeIn 0.6s ease-out' }}>
          {/* Location Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={getUserLocation}
              disabled={locating}
              className="btn"
              style={{
                background: userLocation
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: userLocation ? '#34d399' : 'white',
                border: userLocation ? '1px solid rgba(16,185,129,0.3)' : 'none',
                padding: '10px 18px',
                fontSize: '13px',
              }}
              id="detect-location-btn"
            >
              {locating ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Detecting...</>
              ) : userLocation ? (
                <><Navigation size={16} /> Location Set</>
              ) : (
                <><MapPin size={16} /> Detect My Location</>
              )}
            </button>
            {locationLabel && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px', color: '#94a3b8',
              }}>
                <MapPinned size={14} style={{ color: '#818cf8' }} />
                {locationLabel}
              </div>
            )}
          </div>

          {/* Issue Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#a855f7' }} />
              Describe your issue (AI will auto-detect the legal category)
            </label>
            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="E.g., 'My employer hasn't paid my salary for 3 months' or 'Someone hacked my bank account'..."
              className="input-field"
              style={{
                minHeight: '80px', resize: 'vertical', lineHeight: '1.5',
              }}
              id="issue-text-input"
            />
            {detectedCategory && !selectedCategory && (
              <div style={{
                marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: 'rgba(168,85,247,0.12)', color: '#c084fc',
                animation: 'fadeIn 0.3s ease',
              }}>
                <Sparkles size={12} />
                AI Detected: {CATEGORY_ICONS[detectedCategory]} {detectedCategory}
              </div>
            )}
          </div>

          {/* Category + Radius + Sort Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                Category (or let AI detect)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '13px' }}
                id="category-select"
              >
                <option value="">Auto-detect</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                Search Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '13px' }}
                id="radius-select"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={200}>200 km</option>
                <option value={500}>500 km (All India)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '13px' }}
                id="sort-select"
              >
                <option value="relevance">Relevance</option>
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee-low">Lowest Fee</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={searchLawyers}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
            }}
            id="find-lawyers-btn"
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
            ) : (
              <><Search size={18} /> Find Lawyers Near Me</>
            )}
          </button>
        </div>

        {/* Results Meta */}
        {resultMeta && searched && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#818cf8' }} />
                {resultMeta.total} Lawyer{resultMeta.total !== 1 ? 's' : ''} Found
              </h3>
              {resultMeta.category && resultMeta.category !== 'Other' && (
                <span style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                }}>
                  {CATEGORY_ICONS[resultMeta.category]} {resultMeta.category}
                  {resultMeta.detectedFromText && ' (AI Detected)'}
                </span>
              )}
            </div>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Within {resultMeta.radius} km radius
            </span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : searched && lawyers.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.5s ease' }}>
            <AlertCircle size={48} style={{ color: '#475569', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#94a3b8' }}>
              No Lawyers Found Nearby
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
              Try increasing the search radius or changing the category to find more advocates.
            </p>
            <button
              onClick={() => { setRadius(500); setTimeout(searchLawyers, 100); }}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
              id="expand-search-btn"
            >
              <MapPin size={16} /> Search All India
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {lawyers.map((lawyer, index) => (
              <div
                key={lawyer._id}
                className="glass-card"
                style={{
                  padding: '0', overflow: 'hidden',
                  animation: `fadeIn ${0.3 + index * 0.08}s ease-out`,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(expandedId === lawyer._id ? null : lawyer._id)}
                id={`lawyer-card-${lawyer._id}`}
              >
                {/* Main Row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 24px', flexWrap: 'wrap',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `linear-gradient(135deg, ${getAvatarColor(lawyer.specialization)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: '800', color: 'white', flexShrink: 0,
                  }}>
                    {lawyer.name.split(' ').slice(-1)[0][0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{lawyer.name}</h3>
                      {lawyer.isVerified && (
                        <BadgeCheck size={16} style={{ color: '#34d399' }} title="Verified Advocate" />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#94a3b8' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                        background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                      }}>
                        {lawyer.specialization}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={13} /> {lawyer.experience} yrs
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {lawyer.distanceText}
                      </span>
                    </div>
                  </div>

                  {/* Rating + Fee */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '6px' }}>
                      {renderStars(lawyer.rating)}
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>{lawyer.rating}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({lawyer.reviewCount})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontSize: '14px', color: '#34d399', fontWeight: '700' }}>
                      <IndianRupee size={14} />
                      {lawyer.consultationFee > 0 ? `${lawyer.consultationFee}` : 'Free'}
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400' }}>/consult</span>
                    </div>
                  </div>

                  {/* Expand icon */}
                  <div style={{ color: '#64748b', flexShrink: 0 }}>
                    {expandedId === lawyer._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === lawyer._id && (
                  <div style={{
                    padding: '0 24px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '20px',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      {/* Contact */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Contact Information
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(16,185,129,0.1)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Phone size={14} style={{ color: '#34d399' }} />
                            </div>
                            <span>{lawyer.contact.phone}</span>
                          </div>
                          {lawyer.contact.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(59,130,246,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Mail size={14} style={{ color: '#60a5fa' }} />
                              </div>
                              <span style={{ color: '#94a3b8' }}>{lawyer.contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Details
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(99,102,241,0.1)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <MapPinned size={14} style={{ color: '#818cf8' }} />
                            </div>
                            <span style={{ color: '#94a3b8' }}>
                              {lawyer.location.address}, {lawyer.location.city}, {lawyer.location.state}
                            </span>
                          </div>
                          {lawyer.barCouncilId && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(168,85,247,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Award size={14} style={{ color: '#c084fc' }} />
                              </div>
                              <span style={{ color: '#94a3b8' }}>Bar Council: {lawyer.barCouncilId}</span>
                            </div>
                          )}
                          {lawyer.languages?.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(245,158,11,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Globe size={14} style={{ color: '#f59e0b' }} />
                              </div>
                              <span style={{ color: '#94a3b8' }}>{lawyer.languages.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Practice Areas */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Practice Areas
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {lawyer.categories?.map(cat => (
                            <span key={cat} style={{
                              padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                              {CATEGORY_ICONS[cat] || '⚖️'} {cat}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                            background: lawyer.availability === 'available'
                              ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: lawyer.availability === 'available' ? '#34d399' : '#f59e0b',
                          }}>
                            <Clock size={11} />
                            {lawyer.availability === 'available' ? 'Available Now' : 'Busy'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        {!searched && (
          <div className="glass-card" style={{ padding: '28px', marginTop: '8px', animation: 'fadeIn 0.7s ease-out' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: '#818cf8' }} />
              How Smart Advocate Finder Works
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {[
                { icon: <MapPin size={20} />, color: '#34d399', bg: 'rgba(16,185,129,0.1)', title: 'Location Based', desc: 'Uses your GPS to find advocates practicing near your area' },
                { icon: <Sparkles size={20} />, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', title: 'AI Category Detection', desc: 'Describe your issue and AI will match you with the right type of lawyer' },
                { icon: <Scale size={20} />, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', title: 'IPC Smart Mapping', desc: 'Automatically maps theft → Criminal, fraud → Cyber, divorce → Family lawyer' },
                { icon: <BadgeCheck size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'Verified Advocates', desc: 'All listed advocates are verified with Bar Council registration' },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: tip.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: tip.color, flexShrink: 0,
                  }}>
                    {tip.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{tip.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Helper: avatar gradient colors based on specialization
function getAvatarColor(spec) {
  const colors = {
    'Criminal Law': '#ef4444, #dc2626',
    'Family Law': '#ec4899, #db2777',
    'Cyber Law': '#3b82f6, #2563eb',
    'Consumer Law': '#f59e0b, #d97706',
    'Labor Law': '#f97316, #ea580c',
    'Property Law': '#10b981, #059669',
    'Environmental Law': '#22c55e, #16a34a',
    'Financial Law': '#6366f1, #4f46e5',
    'Constitutional Law': '#8b5cf6, #7c3aed',
    'Corporate Law': '#06b6d4, #0891b2',
    'Healthcare Law': '#14b8a6, #0d9488',
    'Education Law': '#a855f7, #9333ea',
    'Traffic Law': '#f43f5e, #e11d48',
    'Civil Law': '#6366f1, #4f46e5',
    'General Practice': '#64748b, #475569',
  };
  return colors[spec] || '#6366f1, #a855f7';
}

export default FindAdvocatePage;
