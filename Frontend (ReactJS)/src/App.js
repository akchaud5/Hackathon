import { Route, Routes } from 'react-router-dom';
import './index.css';
import './css-override.css'; // Added global CSS override
import styles from './App.module.css';
import Layout from "./components/Layout";
import React, { useEffect } from 'react';
import Home from "./components/Home";
import Search from './components/Search';
import DataHandling from './components/DataHandling';
import Calendar from './components/Calendar';
import Contact from './components/Contact';
import MultiSelect from './components/MultiSelect';
import Historic from './components/Historic';
import StudyPlanGenerator from './components/AIFeatures/StudyPlanGenerator';
import CognitiveLoadBalancer from './components/AIFeatures/CognitiveLoadBalancer';
import ConflictResolution from './components/AIFeatures/ConflictResolution';
import ResourceGenerator from './components/AIFeatures/ResourceGenerator';
import StudyCompanion from './components/AIFeatures/StudyCompanion';
import ExamAnalytics from './components/AIFeatures/ExamAnalytics';
import NotificationPanel from './components/NotificationPanel';
import notificationService from './services/NotificationService';


function App() {
  // Initialize notifications when app starts
  useEffect(() => {
    notificationService.initializeNotifications();
  }, []);

  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="data" element={<DataHandling />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="contact" element={<Contact />} />
          <Route path="multiselect" element={<MultiSelect />} />
          <Route path="historical" element={<Historic />} />
          <Route path="studyplan" element={<StudyPlanGenerator />} />
          <Route path="cognitiveload" element={<CognitiveLoadBalancer />} />
          <Route path="conflicts" element={<ConflictResolution />} />
          <Route path="resources" element={<ResourceGenerator />} />
          <Route path="companion" element={<StudyCompanion />} />
          <Route path="analytics" element={<ExamAnalytics />} />
          <Route path="notifications" element={<NotificationPanel />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
