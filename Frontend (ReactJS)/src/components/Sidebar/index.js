import styles from './index.module.css'
import React, { useState } from 'react'
import { Link, NavLink } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faSearch, 
  faCalendar, 
  faEnvelope, 
  faClose, 
  faBars, 
  faHistory, 
  faBrain, 
  faBalanceScale,
  faExclamationTriangle,
  faBook,
  faRobot,
  faBell,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'
import LogoMcGill from "../../assets/McGillLogo.png"

const Sidebar = () => {
    const [showNav, setShowNav] = useState(false)

    const closeNav = () => {
        setShowNav(false);
    };

    return (
        <div className={styles.navBar}>
            <Link className={styles.logo} to="/">
                <img className={styles.logoImg} src={LogoMcGill} alt="logo" />
            </Link>
            <nav className={`${styles.nav} ${showNav ? styles.mobileShow : ""}`}>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.homeLink}`} to="/" onClick={closeNav}>
                    <FontAwesomeIcon icon={faHome} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.searchLink}`} to="/search" onClick={closeNav}>
                    <FontAwesomeIcon icon={faSearch} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.calendarLink}`} to="/calendar" onClick={closeNav}>
                    <FontAwesomeIcon icon={faCalendar} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.historyLink}`} to="/historical" onClick={closeNav}>
                    <FontAwesomeIcon icon={faHistory} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.aiLink}`} to="/studyplan" onClick={closeNav}>
                    <FontAwesomeIcon icon={faBrain} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.balanceLink}`} to="/cognitiveload" onClick={closeNav}>
                    <FontAwesomeIcon icon={faBalanceScale} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.conflictLink}`} to="/conflicts" onClick={closeNav}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.resourcesLink}`} to="/resources" onClick={closeNav}>
                    <FontAwesomeIcon icon={faBook} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.companionLink}`} to="/companion" onClick={closeNav}>
                    <FontAwesomeIcon icon={faRobot} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.analyticsLink}`} to="/analytics" onClick={closeNav}>
                    <FontAwesomeIcon icon={faChartLine} />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.notificationLink}`} to="/notifications" onClick={closeNav}>
                    <FontAwesomeIcon icon={faBell} size="lg" />
                </NavLink>
                <NavLink exact="true" activeClassName={styles.active} className={`${styles.navLink} ${styles.contactLink}`} to="/contact" onClick={closeNav}>
                    <FontAwesomeIcon icon={faEnvelope} />
                </NavLink>
                <a href="https://www.mcgill.ca/exams/dates" className={styles.buttonLink} target="_blank" rel="noopener noreferrer" onClick={closeNav}>
                    VIEW EXAMS
                </a>
                <FontAwesomeIcon icon={faClose} size="3x" className={styles.closeIcon} onClick={closeNav} />
            </nav>
            <FontAwesomeIcon onClick={() => setShowNav(!showNav)} icon={faBars} size="3x" className={styles.hamburgerIcon} />
        </div>
    )
}

export default Sidebar
