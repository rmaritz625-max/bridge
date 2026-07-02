import { useState, useRef, useEffect } from "react";
import { Anchor, Compass, Settings, Package, BookOpen, Calendar, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Users, User, Bell, Search, Trash2, Edit3, Plus, Check, X, AlertTriangle, AlertCircle, Lock, Unlock, Eye, RefreshCw, Download, Upload, FileText, File, FolderOpen, Image, Save, Send, Mail, MessageSquare, Shield, Wrench, Zap, Clock, MapPin, Navigation, Clipboard, ClipboardList, BarChart2, ShoppingCart, Filter, List, Home, Building2, ChefHat, Waves, Ship, Crown, Handshake, Bot, Lightbulb, CheckCircle, XCircle, ArrowRight, RotateCcw, Paperclip, Globe, Menu, LayoutDashboard, LogIn, ChevronRight, ChevronDown, ChevronLeft, MoreVertical, Star, Award, Flag, Camera, Printer, Tag, UserCheck, Sailboat, Coffee, Briefcase, Megaphone, Info, MinusCircle, Umbrella, Heart, Utensils, Ban, HelpCircle } from "lucide-react";

// ── AUDIT SEED DATA ──────────────────────────────────────────
const INIT_AUDIT = [
  {id:1,timestamp:"23/06/2026, 08:14",user:"Captain",role:"Captain",module:"Tasks",action:"Task Approved",detail:"Port engine oil change - marked Done and approved"},
  {id:2,timestamp:"23/06/2026, 08:02",user:"Chief Engineer",role:"Engineer",module:"Tasks",action:"Task Submitted",detail:"Port engine oil change - submitted for approval"},
  {id:3,timestamp:"22/06/2026, 17:45",user:"Captain",role:"Captain",module:"Tasks",action:"Task Assigned",detail:"Owner arrival cabin prep - Stew (Critical, due 2 days)"},
  {id:4,timestamp:"22/06/2026, 16:30",user:"Captain",role:"Captain",module:"Tasks",action:"Task Assigned",detail:"Owner charter menu plan - Chef (Critical, due tomorrow)"},
  {id:5,timestamp:"22/06/2026, 14:15",user:"Management",role:"Management",module:"Crew",action:"Crew Added",detail:"New crew member added: Chef - Private Chef"},
  {id:6,timestamp:"22/06/2026, 11:00",user:"Captain",role:"Captain",module:"Documents",action:"Document Updated",detail:"Hull & P&I Insurance - expiry date updated"},
  {id:7,timestamp:"21/06/2026, 09:30",user:"Management",role:"Management",module:"Crew",action:"Crew Doc Added",detail:"Stew - ENG1 Medical certificate added (expires in 8 days)"},
  {id:8,timestamp:"20/06/2026, 16:00",user:"Captain",role:"Captain",module:"Tasks",action:"Task Completed",detail:"Teak deck inspection - marked Done"},
  {id:9,timestamp:"20/06/2026, 10:45",user:"Chief Engineer",role:"Engineer",module:"Tasks",action:"Task Started",detail:"Port engine oil change - started"},
  {id:10,timestamp:"19/06/2026, 14:20",user:"Management",role:"Management",module:"Documents",action:"Document Added",detail:"ISM Safety Management Certificate uploaded"},
  {id:11,timestamp:"18/06/2026, 09:00",user:"Captain",role:"Captain",module:"Tasks",action:"Task Reassigned",detail:"Generator #1 250hr service - reassigned to Chief Engineer"},
  {id:12,timestamp:"17/06/2026, 15:30",user:"Management",role:"Management",module:"Crew",action:"Crew Updated",detail:"Stew - contract end date updated to 2026-07-10"},
];


// ═══════════════════════════════════════════════════════════════
// BRIDGE — Yacht Operations Platform  |  Phase 1: Dashboard + Tasks
// ═══════════════════════════════════════════════════════════════

// ── ICON HELPER — consistent sizing and colour ──────────────────
// Usage: <Ico i={Anchor} s={16} c={C.white}/> 
// i=icon component, s=size(px), c=color
function Ico({i:I, s=16, c, style={}}) {
  return <I size={s} color={c} strokeWidth={1.8} style={{flexShrink:0,...style}}/>;
}

const C = {
  // GCY light theme — clean whites, navy panels, azure accents
  bg:"#f4f8fd",        // page background — light sky
  navy:"#16315f",      // dark navy — topbar, sidebar, dark panels
  navyMid:"#1e3a6e",   // navy hover
  navyLight:"#eaf2fb", // light sky — input backgrounds, secondary surfaces
  border:"#dce6f3",    // light border
  card:"#ffffff",      // white card surface
  cardHover:"#f0f5fc", // card hover
  brass:"#b8942a",     // GCY gold-dark — readable on white
  brassL:"#e8c84a",    // gold light — used on dark navy backgrounds only
  signal:"#dc2626",    // red — errors, overdue
  amber:"#d97706",     // amber — warnings
  green:"#15803d",     // dark green — readable on white
  greenL:"#16a34a",    // green light
  purple:"#7c3aed",    // purple — awaiting approval
  blue:"#2f6fd0",      // GCY azure — buttons, links
  orange:"#ea580c",    // orange
  white:"#ffffff",     // white — text on dark navy backgrounds
  muted:"#5b6b86",     // muted text on white backgrounds
  text:"#0f2547",      // primary text on white backgrounds — GCY --ink
};

const ROLES = {
  owner:      { label:"Owner",      icon:"⚓", IconC:Anchor,      color:C.brass  },
  management: { label:"Management", icon:"🏢", IconC:Building2,   color:C.brassL },
  captain:    { label:"Captain",    icon:"🧭", IconC:Compass,     color:C.brassL },
  engineer:   { label:"Engineer",   icon:"⚙️",  IconC:Wrench,      color:C.blue   },
  stew:       { label:"Stew",       icon:"✦",   IconC:Star,        color:C.purple },
  deckhand:   { label:"Deckhand",   icon:"⛵",  IconC:Sailboat,    color:C.green  },
  chef:       { label:"Chef",       icon:"🍽️",  IconC:ChefHat,     color:C.orange },
  agent:      { label:"Agent",      icon:"🤝", IconC:Handshake,   color:"#3b9fd4" },
};

// Role icon component
function RoleIcon({role, size=16, color}) {
  const r = ROLES[role];
  if(!r) return null;
  const I = r.IconC || Anchor;
  return <I size={size} color={color||r.color} strokeWidth={1.8}/>;
}


// ═══════════════════════════════════════════════════════════════
// CREW POSITIONS — industry-standard yacht roles with dept mapping
// ═══════════════════════════════════════════════════════════════
const CREW_POSITIONS = [
  // ── COMMAND ──────────────────────────────────────────────────
  { position:"Captain",              role:"captain",  depts:["Command"],               notifCats:["task","maintenance","document","inventory","enquiry","brief","compliance"] },
  { position:"First Officer",        role:"captain",  depts:["Command"],               notifCats:["task","compliance","document"] },
  { position:"Chief Officer",        role:"captain",  depts:["Command"],               notifCats:["task","compliance","document"] },
  { position:"Second Officer",       role:"captain",  depts:["Command"],               notifCats:["task","compliance","document","maintenance"] },
  { position:"Third Officer",        role:"captain",  depts:["Command"],               notifCats:["task","compliance"] },
  // ── ENGINEERING ──────────────────────────────────────────────
  { position:"Chief Engineer",       role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance","inventory"] },
  { position:"First Engineer",       role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance","inventory"] },
  { position:"Second Engineer",      role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance"] },
  { position:"Third Engineer",       role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance"] },
  { position:"Engineer",             role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance"] },
  { position:"ETO / AV-IT Officer",  role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance"] },
  { position:"Electrician",          role:"engineer", depts:["Engineering"],           notifCats:["task","maintenance"] },
  // ── DECK ─────────────────────────────────────────────────────
  { position:"Bosun",                role:"deckhand", depts:["Deck"],                  notifCats:["task","inventory"] },
  { position:"Lead Deckhand",        role:"deckhand", depts:["Deck"],                  notifCats:["task"] },
  { position:"Deckhand",             role:"deckhand", depts:["Deck"],                  notifCats:["task"] },
  { position:"Junior Deckhand",      role:"deckhand", depts:["Deck"],                  notifCats:["task"] },
  { position:"Watersports Instructor",role:"deckhand",depts:["Deck"],                  notifCats:["task"] },
  { position:"Dive Instructor",      role:"deckhand", depts:["Deck"],                  notifCats:["task"] },
  { position:"Security Officer",     role:"deckhand", depts:["Deck"],                  notifCats:["task"] },
  // ── INTERIOR ─────────────────────────────────────────────────
  { position:"Purser",               role:"stew",     depts:["Interior"],              notifCats:["task","inventory","document"] },
  { position:"Chief Stewardess",     role:"stew",     depts:["Interior"],              notifCats:["task","inventory"] },
  { position:"Chief Steward",        role:"stew",     depts:["Interior"],              notifCats:["task","inventory"] },
  { position:"Second Stewardess",    role:"stew",     depts:["Interior"],              notifCats:["task","inventory"] },
  { position:"Second Steward",       role:"stew",     depts:["Interior"],              notifCats:["task","inventory"] },
  { position:"Third Stewardess",     role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Third Steward",        role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Stewardess",           role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Steward",              role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Junior Stewardess",    role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Junior Steward",       role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Sole Stewardess",      role:"stew",     depts:["Interior"],              notifCats:["task","inventory"] },
  // ── WELLNESS & SUPPORT ───────────────────────────────────────
  { position:"Spa Therapist",        role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Masseuse",             role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Nanny / Childcare",    role:"stew",     depts:["Interior"],              notifCats:["task"] },
  { position:"Personal Trainer",     role:"stew",     depts:["Interior"],              notifCats:["task"] },
  // ── GALLEY ───────────────────────────────────────────────────
  { position:"Head Chef",            role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Executive Chef",       role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Sous Chef",            role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Pastry Chef",          role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Chef",                 role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Cook",                 role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  { position:"Crew Cook",            role:"chef",     depts:["Galley"],                notifCats:["task","inventory"] },
  // ── HYBRID ROLES ─────────────────────────────────────────────
  { position:"Deck Stewardess",      role:"stew",     depts:["Deck","Interior"],       notifCats:["task","inventory"] },
  { position:"Deck Steward",         role:"stew",     depts:["Deck","Interior"],       notifCats:["task","inventory"] },
  { position:"Deckhand / Stewardess",role:"stew",     depts:["Deck","Interior"],       notifCats:["task"] },
  { position:"Stew / Cook",          role:"stew",     depts:["Interior","Galley"],     notifCats:["task","inventory"] },
  { position:"Deck / Engineer",       role:"engineer", depts:["Deck","Engineering"],    notifCats:["task","maintenance","inventory"] },
  { position:"Mate / Engineer",      role:"engineer", depts:["Deck","Engineering"],    notifCats:["task","maintenance"] },
  { position:"Captain / Engineer",   role:"captain",  depts:["Command","Engineering"], notifCats:["task","maintenance","compliance","document"] },
];

// ── TASK PERMISSION TIERS ─────────────────────────────────────
// Tier 1 (Command): Full access — create, assign anyone, reassign, delete
// Tier 2 (Dept Lead): Create + assign/reassign within own dept only, no delete
// Tier 3 (Crew): Self-tasks only, mark complete, no delete, no reassign
// ── CREW ACCESS LEVELS (Captain-granted, plain language) ─────
const ACCESS_LEVELS = [
  {
    value: "standard",
    label: "View Only",
    icon: "👁", IconC: Eye,
    color: "#6b7a99",
    desc: "Sees their own assigned tasks only. Can mark complete. No assignment or reassignment.",
  },
  {
    value: "lead",
    label: "Department Lead",
    icon: "⭐", IconC: Star,
    color: "#c9a84c",
    desc: "Sees all tasks in their department. Can assign and reassign within their team.",
  },
  {
    value: "full",
    label: "Full Access",
    icon: "🔓", IconC: Unlock,
    color: "#4caf7d",
    desc: "Complete access to all modules and tasks across the vessel. Same as Captain.",
  },
];

const TASK_TIER_1 = ["Captain","First Officer","Chief Officer","Second Officer","Captain / Engineer"];
const TASK_TIER_2 = [
  // Deck leads (Third Officer now highest deck lead, Second Officer moved to Tier 1)
  "Third Officer","Bosun","Lead Deckhand",
  // Engineering leads
  "Chief Engineer","First Engineer","Deck / Engineer","Mate / Engineer","ETO / AV-IT Officer",
  // Interior leads
  "Chief Stewardess","Chief Steward","Second Stewardess","Second Steward","Purser","Sole Stewardess",
  // Galley leads
  "Head Chef","Executive Chef","Sous Chef",
  // Hybrid leads
  "Deck Stewardess","Deck Steward",
];
// Everyone else is Tier 3

// Haptic feedback — Android only, silently ignored on iOS
function haptic(style="light") {
  if(!navigator.vibrate) return;
  if(style==="light")  navigator.vibrate(40);
  if(style==="medium") navigator.vibrate(80);
  if(style==="success")navigator.vibrate([40,30,40]);
  if(style==="error")  navigator.vibrate([80,40,80]);
}

function getAssigneeName(assignedTo, crewList, task=null) {
  if(!assignedTo) return "—";
  // If task has a stored name + specific ID, use that
  if(task?.assignedToName && task?.assignedToId) {
    const byId = crewList.find(c=>c.id===task.assignedToId);
    if(byId) return `${byId.name} (${byId.position||ROLES[byId.role]?.label||""})`;
    return task.assignedToName;
  }
  // Check if it's a crew ID
  const byId = crewList.find(c=>c.id===assignedTo);
  if(byId) return `${byId.name} (${byId.position||ROLES[byId.role]?.label||""})`;
  // Fall back to role label
  return ROLES[assignedTo]?.label || assignedTo;
}

function getCrewTier(crewList, role, userId=null) {
  const me = (userId && crewList.find(c=>c.id===userId)) || crewList.find(c=>c.role===role);
  if(!me) return ["captain","management"].includes(role) ? 1 : 3;
  // Captain-granted access level overrides position-based tier
  if(me.accessLevel==="full")     return 1;
  if(me.accessLevel==="lead")     return 2;
  if(me.accessLevel==="standard") return 3;
  // Default: derive from position
  if(TASK_TIER_1.includes(me.position)) return 1;
  if(TASK_TIER_2.includes(me.position)) return 2;
  return 3;
}

// Helper: look up position record
function getPositionInfo(positionLabel) {
  return CREW_POSITIONS.find(p=>p.position===positionLabel) || null;
}

// Helper: get departments for a crew member
function getCrewDepts(member) {
  const info = getPositionInfo(member.position);
  return info ? info.depts : [];
}

// Helper: given a notification category, which crew positions should receive it?
// dept-to-category routing table
const DEPT_NOTIF_MAP = {
  Engineering: ["maintenance","inventory"],
  Deck:        ["task","inventory"],
  Interior:    ["task","inventory"],
  Galley:      ["task","inventory"],
  Command:     ["task","maintenance","document","compliance","brief","enquiry","inventory"],
};


// ═══════════════════════════════════════════════════════════════
// VESSEL PROFILE COMPLETION SYSTEM
// ═══════════════════════════════════════════════════════════════
const PROFILE_FIELDS = [
  // ── VESSEL IDENTITY (must fill in) ───────────────────────────
  { key:"yachtName",       label:"Yacht Name",            section:"Identity",      weight:1, critical:true,  charterOnly:false, check:p=>!!p.yachtName?.trim() },
  { key:"yachtType",       label:"Vessel Type",           section:"Identity",      weight:1, critical:true,  charterOnly:false, check:p=>!!p.yachtType&&p.yachtType!=="Charter" },
  { key:"vesselClass",     label:"Vessel Class",          section:"Identity",      weight:1, critical:false, charterOnly:false, check:p=>!!p.vesselClass?.trim() },
  { key:"lengthM",         label:"Vessel Length (m)",     section:"Identity",      weight:1, critical:true,  charterOnly:false, check:p=>!!p.lengthM },
  { key:"guestCapacity",   label:"Guest Capacity",        section:"Identity",      weight:1, critical:true,  charterOnly:false, check:p=>!!p.guestCapacity },
  { key:"overnightCapacity",label:"Overnight Capacity",   section:"Identity",      weight:1, critical:false, charterOnly:false, check:p=>!!p.overnightCapacity },
  { key:"homeMarina",      label:"Home Marina / Port",    section:"Identity",      weight:1, critical:false, charterOnly:false, check:p=>!!p.homeMarina?.trim() },
  { key:"operatingRegion", label:"Operating Region",      section:"Identity",      weight:1, critical:false, charterOnly:false, check:p=>!!p.operatingRegion?.trim() },
  // ── OFFICIAL DOCUMENTATION (required for MLC / flag state) ───
  { key:"imoNumber",       label:"IMO Number",            section:"Documentation", weight:1, critical:true,  charterOnly:false, check:p=>!!p.imoNumber?.trim() },
  { key:"flagState",       label:"Flag State",            section:"Documentation", weight:1, critical:true,  charterOnly:false, check:p=>!!p.flagState?.trim() },
  { key:"portOfRegistry",  label:"Port of Registry",      section:"Documentation", weight:1, critical:true,  charterOnly:false, check:p=>!!p.portOfRegistry?.trim() },
  { key:"officialNumber",  label:"Official Number",       section:"Documentation", weight:1, critical:false, charterOnly:false, check:p=>!!p.officialNumber?.trim() },
  { key:"callSign",        label:"Call Sign",             section:"Documentation", weight:1, critical:false, charterOnly:false, check:p=>!!p.callSign?.trim() },
  { key:"mmsi",            label:"MMSI",                  section:"Documentation", weight:1, critical:false, charterOnly:false, check:p=>!!p.mmsi?.trim() },
  { key:"grossTonnage",    label:"Gross Tonnage (GT)",    section:"Documentation", weight:1, critical:false, charterOnly:false, check:p=>!!p.grossTonnage?.toString().trim() },
  // ── CHARTER / COMMERCIAL ─────────────────────────────────────
  { key:"dailyRate",       label:"Daily Rate",            section:"Pricing",       weight:1, critical:true,  charterOnly:true,  check:p=>!!p.dailyRate },
  { key:"charterTypes",    label:"Charter Types",         section:"Charter",       weight:1, critical:false, charterOnly:true,  check:p=>Array.isArray(p.charterTypes)&&p.charterTypes.length>0 },
  { key:"amenities",       label:"Amenities Listed",      section:"Features",      weight:1, critical:false, charterOnly:false, check:p=>Array.isArray(p.amenities)&&p.amenities.length>0 },
  // ── CHARTER RULES (enforced by calendar) ─────────────────────
  { key:"_minNotice",      label:"Minimum Notice Set",    section:"Rules",         weight:1, critical:true,  charterOnly:true,  check:(_p,r)=>r&&r.minNoticeHours>0 },
  { key:"_turnaround",     label:"Turnaround Time Set",   section:"Rules",         weight:1, critical:true,  charterOnly:true,  check:(_p,r)=>r&&r.turnaroundHours>0 },
];

// Threshold for agent visibility
const PROFILE_THRESHOLD = 70;

// Calculate profile score for a vessel profile object
function calcProfileScore(p, rules) {
  const isCharter = p.yachtType !== "Private";
  const applicable = PROFILE_FIELDS.filter(f => !f.charterOnly || isCharter);
  const totalWeight = applicable.reduce((s,f) => s+f.weight, 0);
  const earnedWeight = applicable.filter(f => f.check(p, rules)).reduce((s,f) => s+f.weight, 0);
  const pct = Math.round((earnedWeight / totalWeight) * 100);
  const missing = applicable.filter(f => !f.check(p, rules));
  const missingCritical = missing.filter(f => f.critical);
  const agentReady = pct >= PROFILE_THRESHOLD && missingCritical.length === 0;
  return { pct, missing, missingCritical, agentReady, applicable };
}

// USERS is now derived dynamically from crew records in Bridge component
// These are the fixed non-crew roles always available
const FIXED_USERS = [
  { id:"u0", name:"Owner",      role:"owner"      },
  { id:"u1", name:"Management", role:"management" },
  { id:"u7", name:"Agent",      role:"agent"      },
];


// ═══════════════════════════════════════════════════════════════
// PERMISSIONS — role-based access control
// ═══════════════════════════════════════════════════════════════
const PERMS = {
  owner:      { nav:["dashboard","calendar","maintenance","crew","inventory","logbook","leave","weather"], canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:true  },
  management: { nav:["dashboard","tasks","maintenance","inventory","logbook","calendar","weather","crew","documents","drive","ai","audit","leave","hours"],canAssignTasks:true,canApproveTasks:true,canManageCrew:true,canManageDocs:true,readOnly:false },
  captain:    { nav:["dashboard","tasks","maintenance","inventory","logbook","calendar","weather","crew","documents","drive","ai","audit","leave","hours"],canAssignTasks:true,canApproveTasks:true,canManageCrew:true,canManageDocs:true,readOnly:false },
  engineer:   { nav:["dashboard","tasks","maintenance","inventory","calendar","ai","weather","leave","hours"],          canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:false },
  stew:       { nav:["dashboard","tasks","inventory","calendar","ai","weather","leave","hours"],                       canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:false },
  deckhand:   { nav:["dashboard","tasks","maintenance","calendar","weather","leave","hours"],                          canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:false },
  chef:       { nav:["dashboard","tasks","inventory","calendar","ai","weather","leave","hours"],                       canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:false },
  agent:      { nav:["dashboard","weather"],                                                                    canAssignTasks:false, canApproveTasks:false, canManageCrew:false, canManageDocs:false, readOnly:true, isAgent:true },
};

function can(role,perm) { return PERMS[role]?.[perm]||false; }
function hasNav(role,id) { return (PERMS[role]?.nav||[]).includes(id); }

const TODAY = new Date().toISOString().split("T")[0];
const d = n => { const dt=new Date(); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
let _id = 1;
const mk = (title,desc,to,by,dept,priority,recurrence,category,offset,status) => ({
  id:_id++, title, desc:desc||"", assignedTo:to, assignedBy:by||"captain",
  dept, priority, recurrence, category,
  dueDate: d(offset), status: status||(offset<0?"Overdue":"Pending"),
  notes:"", photos:[], completedAt:null, approvedBy:null,
});

const INIT_TASKS = [
  // ── ENGINEER ──
  mk("Check engine room — morning","Oil, coolant, bilges, visual inspection","engineer","captain","Engineering","High","Daily","Maintenance",-1,"Overdue"),
  mk("Record engine hours","Log starboard and port engine hours","engineer","captain","Engineering","High","Daily","Admin",0),
  mk("Check generator — oil & coolant","Both generators, log readings","engineer","captain","Engineering","High","Daily","Maintenance",0),
  mk("Check watermaker output & pressure","Log daily output, check membrane pressure","engineer","captain","Engineering","Medium","Daily","Systems",0),
  mk("Check battery bank voltage & charge","All battery banks checked and logged","engineer","captain","Engineering","High","Daily","Systems",0),
  mk("Check bilges — engine room","Inspect all bilge compartments","engineer","captain","Engineering","High","Daily","Maintenance",0),
  mk("Inspect belts and hoses — engine room","Look for wear, cracking, leaks","engineer","captain","Engineering","Medium","Weekly","Maintenance",3),
  mk("Test emergency bilge pumps","All bilge pumps tested and logged","engineer","captain","Engineering","High","Weekly","Safety",4),
  mk("Check fuel filters","Inspect primary and secondary fuel filters","engineer","captain","Engineering","High","Weekly","Maintenance",5),
  mk("Check all pumps — sea cocks and through-hulls","Inspect operation and seating","engineer","captain","Engineering","High","Weekly","Safety",5),
  mk("Generator #1 — 250hr service","Oil, filters, impeller. Log in engine hours book. Current: 1247hrs. Due: 1250hrs.","engineer","captain","Engineering","Critical","One-off","Maintenance",7),
  mk("AC system — filters and condensate drains","Clean all AC filters, clear condensate drains","engineer","captain","Engineering","Medium","Monthly","Systems",12),
  mk("Service stabilisers — check hydraulic fluid","Inspect fins, hydraulic lines and fluid level","engineer","captain","Engineering","High","Monthly","Maintenance",14),
  mk("Fire suppression system — monthly check","Inspect engine room suppression system","engineer","captain","Engineering","High","Monthly","Safety",14),
  mk("Fuel filter replacement — both engines","Replace primary and secondary filters","engineer","captain","Engineering","High","6-Monthly","Maintenance",45),
  mk("Port engine oil change","Drain, replace filter, refill with correct spec","engineer","captain","Engineering","High","Quarterly","Maintenance",20,"Awaiting Approval"),

  // ── DECKHAND ──
  mk("Exterior wash down — full vessel","Rinse salt, soap wash, wipe dry","deckhand","captain","Deck","High","Daily","Exterior",0),
  mk("Check all fenders & mooring lines","Fenders in position, lines correctly cleated","deckhand","captain","Deck","High","Daily","Safety",-1,"Overdue"),
  mk("Check fluid levels — fuel, grey & black water","Morning and evening readings logged","deckhand","captain","Deck","High","Daily","Maintenance",0),
  mk("Cooler temperature check","Morning, afternoon and evening","deckhand","captain","Deck","High","Daily","Systems",0),
  mk("Shore power connected — confirm","Check cable secure, connection light on","deckhand","captain","Deck","High","Daily","Safety",0),
  mk("Turn off AC & unnecessary lights","Full vessel walk-through before bed","deckhand","captain","Deck","Medium","Daily","Operations",0),
  mk("Lock all doors — saloon, port & stbd","Full security check every evening","deckhand","captain","Deck","High","Daily","Safety",0),
  mk("Jet ski flush and inspection","Fresh water flush, check hull and engine","deckhand","captain","Deck","Medium","Weekly","Equipment",4),
  mk("Dive — waterline, prop, shaft, bow thruster","Full underwater inspection, photograph any growth","deckhand","captain","Deck","High","Weekly","Dive/Water",3),
  mk("Boat soap wash — full vessel","Full wash, rinse and wipe down","deckhand","captain","Deck","Medium","Weekly","Exterior",4),
  mk("Engine room strainer check","Clean and inspect all strainers","deckhand","captain","Deck","High","Weekly","Maintenance",4),
  mk("Polish stainless steel — main deck","Full stainless detail fore to aft","deckhand","captain","Deck","Low","Weekly","Appearance",5),
  mk("Tender wash & inspection","Wash tender inside and out, check hull for damage","deckhand","captain","Deck","Medium","Weekly","Equipment",4),
  mk("Test winches, passerail, boom, watertight doors","Full deck systems test and log","deckhand","captain","Deck","High","Weekly","Safety",5),
  mk("Generator stain removal — port & stbd","Use appropriate cleaner on hull stains","deckhand","captain","Deck","Low","Weekly","Appearance",6),
  mk("Safety equipment inspection","Life jackets, buoys, flares, fire extinguishers","deckhand","captain","Deck","High","Monthly","Safety",14),
  mk("Bilges — full clean and inspect","All bilge compartments pumped and wiped","deckhand","captain","Deck","High","Monthly","Maintenance",14),
  mk("Dive — monthly hull inspection","Full monthly underwater inspection and log","deckhand","captain","Deck","High","Monthly","Dive/Water",14),
  mk("Semco application — teak decks","Apply Semco treatment every 3 months","deckhand","captain","Deck","Medium","Quarterly","Appearance",60),
  mk("Engine anodes check","6 anodes in engine, inspect every 3 months","deckhand","captain","Deck","High","Quarterly","Maintenance",60),
  mk("Fuel filter replacement — 6 monthly","Replace every 6 months, log in engine book","deckhand","captain","Deck","High","6-Monthly","Maintenance",90),
  mk("Teak deck inspection","Walk full teak area. Mark soft spots, photograph damage","deckhand","captain","Deck","Medium","Monthly","Maintenance",14,"Done"),
  mk("Mooring lines — inspect and replace worn","Check all lines for chafe and wear","deckhand","captain","Deck","High","Monthly","Safety",14),

  // ── STEW ──
  mk("Galley clean — dishes, counters, mop, empty bin, stock water","Full galley daily clean","stew","captain","Interior","High","Daily","Galley",0),
  mk("Laundry — start/fold, empty filters, uniform first","Full laundry cycle managed","stew","captain","Interior","High","Daily","Laundry",0),
  mk("Vacuum & mop saloon and staircases","Full interior floor clean","stew","captain","Interior","High","Daily","Cleaning",0),
  mk("Empty all vacuums","Check and empty vacuum bags/canisters","stew","captain","Interior","Medium","Daily","Cleaning",0),
  mk("Wipe guest cupboards, drawers and surfaces","Every 3rd day","stew","captain","Interior","Medium","Daily","Guest Care",0),
  mk("Flush all toilets (every 2nd day)","Every 2nd day","stew","captain","Interior","High","Daily","Cleaning",-1,"Overdue"),
  mk("Check portholes for salt — clean if needed","Every 3rd day","stew","captain","Interior","Low","Daily","Appearance",0),
  mk("Log any scratches or damage — report to Captain","Photograph and note location","stew","captain","Interior","Medium","Daily","Guest Care",0),
  mk("Turn-down service — guest cabins","Evening turn-down, refresh towels and amenities","stew","captain","Interior","High","Daily","Guest Care",0,"Done"),
  mk("Owner arrival cabin prep","Fresh flowers, fruit basket, Molton Brown toiletries, robe, slippers","stew","captain","Interior","Critical","One-off","Owner Request",2),
  mk("Coffee machine detail","Full descale and clean cycle","stew","captain","Interior","Medium","Weekly","Galley",3),
  mk("Deep clean fridges & wine chiller — discard expired products","Full fridge detail and stock check","stew","captain","Interior","High","Weekly","Galley",4),
  mk("Detail galley — inside cupboards, windows, polish sink, spice rack","Full galley deep clean","stew","captain","Interior","High","Weekly","Galley",5),
  mk("Saloon big windows and mirrors","Clean inside-out, streak-free","stew","captain","Interior","Medium","Weekly","Cleaning",5),
  mk("Order water, crew food, cleaning and charter products","Check stock, place orders","stew","captain","Interior","High","Weekly","Inventory",3),
  mk("Polish stainless — door handles, hinges, portholes","Interior stainless detail","stew","captain","Interior","Low","Weekly","Appearance",6),
  mk("Polish drinking glasses","Hand polish all glassware","stew","captain","Interior","Low","Weekly","Guest Care",6),
  mk("Detail toilet bowls","Descale and deep clean all heads","stew","captain","Interior","High","Monthly","Cleaning",14),
  mk("Defrost freezers and ice machine","Full defrost cycle","stew","captain","Interior","High","Monthly","Galley",14),
  mk("Lift shower floors and clean underneath","Remove and scrub shower bases","stew","captain","Interior","High","Monthly","Cleaning",14),
  mk("Wipe under all mattresses — check for mould","Check and wipe surfaces","stew","captain","Interior","High","Monthly","Cleaning",14),
  mk("Descale shataffa, kettle and coffee machine","Full descale treatment","stew","captain","Interior","High","Monthly","Galley",14),
  mk("Bleach shower rubber seals","All shower door seals treated","stew","captain","Interior","High","Monthly","Cleaning",14),
  mk("Dishwasher deep clean","Run clean cycle and descale","stew","captain","Interior","High","Monthly","Galley",14),
  mk("Refill and clean guest toiletries and soaps","All guest bathrooms restocked","stew","captain","Interior","High","Monthly","Guest Care",14),
  mk("Check medication & first aid stock","Inventory all medications, replace expired, reorder","stew","captain","Interior","High","Monthly","Safety",12),

  // ── CHEF ──
  mk("Morning galley prep & breakfast service","Mise en place and breakfast for crew and guests","chef","captain","Galley","High","Daily","Galley",0),
  mk("Daily stock check & provisioning order","Check all stores, order 48hrs in advance","chef","captain","Galley","High","Daily","Inventory",0),
  mk("Galley end-of-day sanitisation","Full surface, knife, board and appliance clean","chef","captain","Galley","High","Daily","Galley",0,"Done"),
  mk("Fridge & freezer temperature log","Morning and evening temp check, log readings","chef","captain","Galley","High","Daily","Galley",-1,"Overdue"),
  mk("Crew meals — breakfast, lunch, dinner","Prepare crew meals to good standard","chef","captain","Galley","High","Daily","Galley",0),
  mk("Prep and brief stew on meal times and service","Coordinate timing, table settings, themes","chef","captain","Galley","Medium","Daily","Operations",0),
  mk("Fridge & dry store — full inventory and expiry check","Check all expiry dates, discard out-of-date","chef","captain","Galley","High","Weekly","Inventory",3),
  mk("Menu plan for upcoming week — confirm dietary requirements","Plan all meals, confirm allergies and preferences","chef","captain","Galley","High","Weekly","Guest Care",3),
  mk("Submit provisioning list to Captain","Full shopping list for next week","chef","captain","Galley","Medium","Weekly","Inventory",3),
  mk("Clean and check all galley equipment","Inspect, clean and test all appliances","chef","captain","Galley","Medium","Weekly","Galley",5),
  mk("Wine and beverage inventory — coordinate with stew","Check cellar, bar and drinks stock","chef","captain","Galley","Medium","Weekly","Inventory",4),
  mk("Owner charter menu plan","Submit proposed menu to Captain. 1x vegetarian, 1x gluten-free guest","chef","captain","Galley","Critical","One-off","Owner Request",1),
  mk("Galley full deep clean — oven, behind fridge, under counters","Monthly deep-detail clean","chef","captain","Galley","High","Monthly","Galley",14),
  mk("Food safety records — review and file","HACCP logs, fridge temp records, cleaning records","chef","captain","Galley","High","Monthly","Admin",14),
  mk("Defrost all freezers and audit frozen stock","Full freezer inventory and defrost","chef","captain","Galley","High","Monthly","Galley",14),

  // ── CAPTAIN ──
  mk("Update vessel logbook","Daily entries — position, weather, crew on board, incidents","captain","management","Captain","High","Daily","Admin",-1,"Overdue"),
  mk("Morning weather briefing","Review all forecasts, GRIB files, issue brief to crew","captain","management","Captain","High","Daily","Navigation",0,"In Progress"),
  mk("Crew daily briefing — assignments and schedule","Brief all crew on day plan, guest itinerary","captain","management","Captain","High","Daily","Operations",0),
  mk("Pre-departure safety check","Engines, safety equipment, fuel, navigation systems","captain","management","Captain","High","Daily","Safety",0),
  mk("Guest/owner liaison — daily check-in","Confirm itinerary, requests, satisfaction","captain","management","Captain","Medium","Daily","Guest Care",0),
  mk("Vessel safety inspection — weekly walk-through","All safety equipment, fire extinguishers, flares, EPIRBs","captain","management","Captain","High","Weekly","Safety",4),
  mk("Crew hours log review","Review all crew working hours for MLC compliance","captain","management","Captain","High","Weekly","Compliance",5),
  mk("Maintenance log review","Review all open maintenance items with engineer and deckhand","captain","management","Captain","Medium","Weekly","Maintenance",5),
  mk("ISM monthly safety sign-off","Complete and sign ISM monthly compliance checklist","captain","management","Captain","High","Monthly","Compliance",8),
  mk("Fire & MOB drill — full crew","Conduct drill, log date, crew present and findings","captain","management","Captain","High","Monthly","Safety",10),
  mk("Submit fuel & operating expenses report","Monthly fuel usage, marina fees, provisioning costs","captain","management","Captain","Medium","Monthly","Admin",8),
  mk("Owner/management monthly report","Performance summary, maintenance, incidents, upcoming","captain","management","Captain","High","Monthly","Admin",8),
  mk("Renew ship radio station licence","Submit renewal to TRA/flag state. Expires in 25 days.","captain","management","Captain","Critical","Annual","Licensing",25),
  mk("Renew vessel insurance","Hull & P&I renewal. Coordinate with management on coverage","captain","management","Captain","Critical","Annual","Licensing",40),
  mk("Renew EPIRB registration","Annual renewal with COSPAS-SARSAT/flag state","captain","management","Captain","High","Annual","Safety",60),
  mk("Safety equipment annual service","Life rafts, flares, fire extinguishers — certified service","captain","management","Captain","High","Annual","Safety",90),
  mk("Flag state compliance survey","Annual flag state inspection — prepare all certificates","captain","management","Captain","High","Annual","Compliance",90),
  mk("Crew STCW certificates review — annual","All crew STCW must be current, 5-year renewal","captain","management","Captain","High","Annual","Compliance",90),
  mk("Charter licence renewal","Renew commercial charter licence with flag state","captain","management","Captain","High","Annual","Licensing",90),
  mk("Life raft annual service","Service by certified provider, update service card","captain","management","Captain","High","Annual","Safety",90),
];

// ── HELPERS ────────────────────────────────────────────────────
function daysUntil(ds) {
  const diff=Math.ceil((new Date(ds)-new Date(new Date().toDateString()))/86400000);
  if(diff<0) return `${Math.abs(diff)}d overdue`;
  if(diff===0) return "Today";
  return `${diff}d`;
}

function calcHealth(tasks,assets,docs,inventory) {
  // Task score — 40%
  const t=tasks.length||1;
  const done=tasks.filter(x=>["Done","Completed"].includes(x.status)).length;
  const ov=tasks.filter(x=>x.status==="Overdue").length;
  const crit=tasks.filter(x=>x.priority==="Critical"&&x.status==="Overdue").length;
  const taskScore=Math.max(0,Math.min(100,Math.round((done/t)*100)-(ov*3)-(crit*8)));

  // Asset score — 30%
  const assetScore=assets&&assets.length ? Math.max(0,100
    - assets.filter(a=>assetServiceStatus&&assetServiceStatus(a)==="Overdue").length*15
    - assets.filter(a=>assetServiceStatus&&assetServiceStatus(a)==="Due Soon").length*5) : 100;

  // Document score — 20%
  const docScore=docs&&docs.length ? Math.max(0,100
    - (docs.filter(d=>d.status==="Expired").length
      + docs.reduce((n,_c)=>n,0))*0  // placeholder keeps structure
    - docs.filter(d=>d.status==="Expired").length*20
    - docs.filter(d=>d.status==="Expiring Soon").length*4) : 100;

  // Inventory score — 10%
  const invScore=inventory&&inventory.length ? Math.max(0,100
    - inventory.filter(i=>i.qty===0&&i.minQty>0).length*10
    - inventory.filter(i=>i.qty>0&&i.minQty>0&&i.qty<i.minQty).length*3) : 100;

  return Math.max(0,Math.min(100,Math.round(
    taskScore*0.40 + assetScore*0.30 + docScore*0.20 + invScore*0.10
  )));
}

function calcGuestReadiness(tasks,inventory,crew) {
  const checks = [
    {label:"Guest cabins prepared",   ok: tasks.filter(t=>t.category==="Guest Care"&&t.status==="Done").length>0},
    {label:"No critical tasks overdue",ok: tasks.filter(t=>t.priority==="Critical"&&t.status==="Overdue").length===0},
    {label:"Interior tasks current",   ok: tasks.filter(t=>t.dept==="Interior"&&t.status==="Overdue").length===0},
    {label:"Deck tasks current",       ok: tasks.filter(t=>t.dept==="Deck"&&t.status==="Overdue").length===0},
    {label:"Guest toiletries stocked", ok: !inventory||inventory.filter(i=>i.category==="Guest Supplies"&&i.qty<i.minQty).length===0},
    {label:"Crew onboard",             ok: crew&&crew.filter(c=>c.onboard).length>=3},
    {label:"Safety equipment checked", ok: tasks.filter(t=>t.category==="Safety"&&t.status==="Overdue").length===0},
    {label:"Galley provisioned",       ok: !inventory||inventory.filter(i=>i.category==="Galley"&&i.qty===0&&i.minQty>0).length===0},
  ];
  const score=Math.round((checks.filter(c=>c.ok).length/checks.length)*100);
  return {score,checks};
}

function calcDept(tasks,dept) {
  const dt=tasks.filter(t=>t.dept===dept);
  if(!dt.length) return 0;
  return Math.round((dt.filter(t=>t.status==="Done"||t.status==="Completed").length/dt.length)*100);
}

// ── PRIMITIVES ─────────────────────────────────────────────────
const inp = { background:C.navyLight, border:`1px solid ${C.border}`, color:C.text, borderRadius:7, padding:"8px 12px", fontSize:13, width:"100%", boxSizing:"border-box", outline:"none" };
const lbl = { display:"block", fontSize:10, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:5 };
const btn = { border:"none", borderRadius:7, padding:"8px 18px", cursor:"pointer", fontWeight:700, fontSize:13 };

function Pill({label,bg,color,small,dot}) {
  return <span style={{background:bg,color,fontSize:small?9:10,fontWeight:700,padding:small?"1px 7px":"3px 10px",borderRadius:20,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>
    {dot&&<span style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>}{label}
  </span>;
}

function sP(status) {
  const m={"Done":{bg:C.green+"22",c:C.greenL},"Completed":{bg:C.green+"22",c:C.greenL},"Overdue":{bg:C.signal+"22",c:C.signal},"In Progress":{bg:C.amber+"22",c:C.amber},"Awaiting Approval":{bg:C.purple+"22",c:C.purple},"Pending":{bg:C.navyLight,c:C.muted}};
  const s=m[status]||{bg:C.navyLight,c:C.muted};
  return <Pill label={status} bg={s.bg} color={s.c} dot/>;
}

function pP(p) {
  const m={Critical:{bg:"#4a1010",c:C.signal},High:{bg:"#3d1a1a",c:"#f87171"},Medium:{bg:"#3a280a",c:C.amber},Low:{bg:"#1a2e1a",c:C.green}};
  const s=m[p]||{bg:C.navyLight,c:C.muted};
  return <Pill label={p} bg={s.bg} color={s.c} small/>;
}

function HealthBar({value,label,height=7,onClick}) {
  const col=value>=80?C.green:value>=60?C.amber:C.signal;
  return <div onClick={onClick} style={{cursor:onClick?"pointer":"default",marginBottom:8}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{fontSize:12,color:C.muted}}>{label}</span>
      <span style={{fontSize:12,fontWeight:700,color:col}}>{value}%</span>
    </div>}
    <div style={{background:C.navyLight,borderRadius:height,overflow:"hidden",height}}>
      <div style={{width:`${value}%`,height:"100%",background:col,borderRadius:height,transition:"width .4s ease"}}/>
    </div>
  </div>;
}

function ScoreRing({value,size=90}) {
  const col=value>=80?C.green:value>=60?C.amber:C.signal;
  const r=34, circ=2*Math.PI*r, dash=(value/100)*circ;
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block",margin:"0 auto"}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.navyLight} strokeWidth={8}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .5s ease"}}/>
    <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={col} fontSize={16} fontWeight={800} style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>{value}%</text>
  </svg>;
}

function StatCard({label,value,color,icon,iconC,sub,onClick}) {
  const [hover,setHover]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{background:hover&&onClick?C.cardHover:C.card,border:`1px solid ${hover&&onClick?C.brass:C.border}`,borderRadius:10,padding:"14px 16px",flex:1,minWidth:100,cursor:onClick?"pointer":"default",transition:"all .15s",transform:hover&&onClick?"translateY(-1px)":"none",boxShadow:hover&&onClick?`0 4px 16px rgba(0,0,0,.3)`:"none"}}>
    {iconC&&<div style={{marginBottom:6}}><Ico i={iconC} s={18} c={color}/></div>}
    {!iconC&&icon&&<div style={{fontSize:18,marginBottom:4}}>{icon}</div>}
    <div style={{fontSize:26,fontWeight:900,color,lineHeight:1,fontFamily:"monospace"}}>{value}</div>
    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>}
    {onClick&&<div style={{fontSize:9,color:hover?C.brass:C.muted,marginTop:4,transition:"color .15s"}}>Tap to view ›</div>}
  </div>;
}

function Modal({title,onClose,children,width=580}) {
  // Push history entry on mount so back button closes this modal
  useEffect(()=>{
    window.history.pushState({modal:true}, "", "");
    const onPop = ()=>onClose();
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[]);

  return <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:1000,padding:"16px 16px 40px",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={onClose}>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width,maxWidth:"95vw",padding:24,position:"relative",marginTop:8}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontWeight:800,fontSize:16,color:C.navy}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,lineHeight:1,padding:0}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

// ── BACK BUTTON UI — handles hardware back AND shows visual button ──
function BackBtn({onBack, label="Back"}) {
  useEffect(()=>{
    window.history.pushState({overlay:true}, "", "");
    const onPop = ()=>onBack();
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[]);
  return <button onClick={onBack}
    style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",
      color:C.muted,cursor:"pointer",fontSize:13,fontWeight:600,padding:"4px 0",marginBottom:12}}>
    <Ico i={ChevronLeft} s={16} c={C.muted}/>{label}
  </button>;
}

function FF({label,type="text",value,onChange,opts,rows,ph,req,half}) {
  const s={...inp,padding:"7px 10px"};
  if(type==="select") return <div style={{marginBottom:12,gridColumn:half?"span 1":"span 2"}}>
    {label&&<label style={lbl}>{label}{req&&" *"}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={s}>
      {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select></div>;
  if(type==="textarea") return <div style={{marginBottom:12,gridColumn:half?"span 1":"span 2"}}>
    {label&&<label style={lbl}>{label}</label>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows||3} placeholder={ph} style={{...s,resize:"vertical"}}/>
  </div>;
  return <div style={{marginBottom:12,gridColumn:half?"span 1":"span 2"}}>
    {label&&<label style={lbl}>{label}{req&&" *"}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={s}/>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════


function AccessDenied() {
  return <div style={{textAlign:"center",padding:"64px 32px",color:C.muted}}>
    <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Ico i={Lock} s={40} c={C.muted}/></div>
    <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Access Restricted</div>
    <div style={{fontSize:13,color:C.muted,maxWidth:300,margin:"0 auto"}}>You don't have permission to view this section. Contact your Captain or Management.</div>
  </div>;
}

function ReadOnlyBanner() {
  return <div style={{background:`${C.brass}15`,border:`1px solid ${C.brass}44`,borderRadius:8,padding:"8px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
    <Ico i={Anchor} s={15} c={C.brass}/>
    <div>
      <span style={{fontSize:12,fontWeight:700,color:C.brass}}>Owner View</span>
      <span style={{fontSize:12,color:C.muted}}> — read-only access. Contact your Captain to make changes.</span>
    </div>
  </div>;
}

function Dashboard({tasks,crew,setCrew=()=>{},docs,assets,inventory,calEntries,role,setView,setInitFilter,setCrewFilter,setDocFilter,vesselRegistry=[],setInitCalView=()=>{}}) {
  const all  = tasks;
  const myDashCrewId = crew.find(c=>c.role===role)?.id;
  const mine = ["management","captain"].includes(role) ? all : all.filter(t=>
    t.assignedTo===role || (myDashCrewId && (t.assignedTo===myDashCrewId || t.assignedToId===myDashCrewId))
  );
  const overdue  = mine.filter(t=>t.status==="Overdue");
  const inprog   = mine.filter(t=>t.status==="In Progress");
  const pending  = mine.filter(t=>t.status==="Pending");
  const done     = mine.filter(t=>t.status==="Done");
  const awaiting = mine.filter(t=>t.status==="Awaiting Approval");
  const critical = mine.filter(t=>t.priority==="Critical"&&t.status!=="Done");
  const health   = calcHealth(mine, assets||[], docs||[], inventory||[]);
  const {score:readiness, checks:readinessChecks} = calcGuestReadiness(tasks, inventory||[], crew||[]);
  const depts    = ["Engineering","Deck","Interior","Galley","Captain"];
  const crewOnboard    = crew.filter(c=>c.onboard);
  const expiredDocs    = docs.filter(d=>d.status==="Expired");
  const expiringDocs   = docs.filter(d=>d.status==="Expiring Soon");
  const crewDocAlerts  = crew.flatMap(c=>c.docs.filter(d=>["Expired","Expiring Soon"].includes(d.status)));
  const totalDocAlerts = expiredDocs.length+expiringDocs.length;
  const goTasks = (statusF,deptF,priorityF) => { setInitFilter({status:statusF||"All",priority:priorityF||"All",dept:deptF||"All",recurrence:"All",search:""}); setView("tasks"); };
  const goCrew  = (f) => { setCrewFilter(f||null); setView("crew"); };
  const goDocs  = (f) => { setDocFilter(f||null);  setView("documents"); };

  // Incomplete vessel profiles — shown to Captain/Management only
  const incompleteVessels = ["captain","management"].includes(role)
    ? vesselRegistry.filter(v => {
        const s = calcProfileScore(v.profile||{}, v.rules);
        return s.pct < 100;
      })
    : [];

  const DeptBar = ({dept}) => {
    const val=calcDept(all,dept);
    const col=val>=80?C.green:val>=60?C.amber:C.signal;
    const deptOv=all.filter(t=>t.dept===dept&&t.status==="Overdue").length;
    const deptMap={Engineering:"Engineering",Deck:"Deck",Interior:"Interior",Galley:"Galley",Captain:"Captain"};
    return <div onClick={()=>goTasks("All",deptMap[dept])} style={{cursor:"pointer",marginBottom:8,padding:"7px 10px",borderRadius:8,transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=C.navyLight}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
        <span style={{fontSize:13,color:C.text,fontWeight:500}}>{dept}</span>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {deptOv>0&&<Pill label={`${deptOv} overdue`} bg={C.signal+"22"} color={C.signal} small/>}
          <span style={{fontSize:12,fontWeight:700,color:col}}>{val}%</span>
        </div>
      </div>
      <div style={{background:C.navyLight,borderRadius:6,overflow:"hidden",height:6}}>
        <div style={{width:`${val}%`,height:"100%",background:col,borderRadius:6,transition:"width .4s ease"}}/>
      </div>
      <div style={{fontSize:10,color:C.muted,marginTop:2}}>{all.filter(t=>t.dept===dept).length} tasks · tap to view -></div>
    </div>;
  };

  const hour = new Date().getHours();

  return <div>
    {/* ReadOnlyBanner removed — owner sees clean dashboard */}
    {/* Dashboard title — always first, same for every role */}
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:900,color:C.navy,display:"flex",alignItems:"center",gap:8}}><RoleIcon role={role} size={22} color={C.navy}/>{ROLES[role].label}{" Dashboard"}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4,gap:10}}>
        <div style={{fontSize:12,color:C.muted}}>{new Date().toLocaleDateString("en-AE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        {/* Onboard/Ashore toggle — Captain, Owner and all crew */}
        {["captain","engineer","stew","deckhand","chef"].includes(role)&&(()=>{
          const me = crew.find(c=>c.role===role);
          if(!me) return null;
          const isOnboard = me.onboard!==false;
          return <button
            onClick={()=>{
                haptic("light");
                const nowOnboard = !(crew.find(c=>c.role===role)?.onboard!==false);
                setCrew(p=>p.map(c=>c.role===role?{...c,onboard:!c.onboard}:c));
                showToast(nowOnboard?"Marked Onboard":"Marked Ashore", "anchor","success");
              }}
            style={{flexShrink:0,padding:"4px 12px",borderRadius:16,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
              background:isOnboard?`${C.greenL}22`:`${C.signal}22`,
              color:isOnboard?C.greenL:C.signal,
              outline:`1px solid ${isOnboard?C.green+"55":C.signal+"55"}`,
              transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
            <Ico i={isOnboard?Anchor:Home} s={12} c={isOnboard?C.greenL:C.signal}/>
            {isOnboard?"Onboard":"Ashore"}
          </button>;
        })()}
      </div>
    </div>
    {/* Banners below title */}
    {incompleteVessels.map(v=>{
      const s = calcProfileScore(v.profile||{}, v.rules);
      const col = s.agentReady?C.amber:C.signal;
      return <div key={v.id} onClick={()=>{setInitCalView("vessel");setView("calendar");}}
        style={{background:`${col}12`,border:`1px solid ${col}44`,borderRadius:10,padding:"11px 14px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <div style={{flexShrink:0}}><Ico i={AlertTriangle} s={16} c={col}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:800,color:col}}>
            {v.profile?.yachtName||"Unnamed Vessel"}{"  —  Profile "}{s.pct}{"% Complete"}
          </div>
          <div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>
            {s.agentReady
              ? `Agent-ready but not fully optimised. ${s.missing.length} field${s.missing.length!==1?"s":""} remaining.`
              : `Hidden from agents until ${PROFILE_THRESHOLD}% reached. Complete: ${s.missingCritical.map(f=>f.label).join(", ")}`
            }
          </div>
        </div>
        <span style={{fontSize:13,color:col,fontWeight:800}}>{s.pct}%</span>
      </div>;
    })}
    {hasNav(role,"ai")&&<div onClick={()=>setView("ai")} style={{background:`${C.brass}12`,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=`${C.brass}20`}
      onMouseLeave={e=>e.currentTarget.style.background=`${C.brass}12`}>
      <div style={{width:32,height:32,borderRadius:8,background:`${C.brass}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Ico i={Bot} s={18} c={C.brass}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:C.brass}}>Bridge AI Assistant</div>
        <div style={{fontSize:11,color:C.muted}}>Readiness Check · Maintenance · Provisioning</div>
      </div>
      <span style={{color:C.brass,fontSize:16}}>›</span>
    </div>}

    {["captain","management"].includes(role)&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:16}}>
      {/* Score rings row */}
      <div style={{display:"flex",gap:24,marginBottom:18,flexWrap:"wrap",alignItems:"flex-start"}}>
        <div style={{textAlign:"center",flexShrink:0}}>
          <ScoreRing value={health}/>
          <div style={{fontSize:10,color:C.muted,marginTop:5,textTransform:"uppercase",letterSpacing:1}}>Yacht Health</div>
          <div style={{fontSize:9,color:health>=80?C.greenL:health>=60?C.amber:C.signal,marginTop:2,fontWeight:600}}>{health>=80?"GOOD":health>=60?"ATTENTION":"ACTION NEEDED"}</div>
        </div>
        <div style={{textAlign:"center",flexShrink:0}}>
          <ScoreRing value={readiness}/>
          <div style={{fontSize:10,color:C.muted,marginTop:5,textTransform:"uppercase",letterSpacing:1}}>Guest Ready</div>
          <div style={{fontSize:9,color:readiness>=80?C.greenL:readiness>=60?C.amber:C.signal,marginTop:2,fontWeight:600}}>{readiness>=80?"READY":readiness>=60?"MINOR ISSUES":"NOT READY"}</div>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Readiness Checks</div>
          {readinessChecks.slice(0,5).map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:c.ok?C.green+"33":C.signal+"33",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:9,color:c.ok?C.greenL:C.signal}}>{c.ok?"✓":"✕"}</span>
            </div>
            <span style={{fontSize:11,color:c.ok?C.text:C.signal}}>{c.label}</span>
          </div>)}
        </div>
      </div>
      {/* Dept bars */}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
          Department Progress <span style={{fontWeight:400}}>· tap to drill down</span>
        </div>
        {depts.map(dept=><DeptBar key={dept} dept={dept}/>)}
      </div>
    </div>}

    {role!=="owner"&&overdue.length>0&&<div onClick={()=>goTasks("Overdue")} style={{background:`${C.signal}12`,border:`1px solid ${C.signal}44`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}
      onMouseEnter={e=>e.currentTarget.style.background=`${C.signal}20`}
      onMouseLeave={e=>e.currentTarget.style.background=`${C.signal}12`}>
      <div style={{flexShrink:0,marginTop:1}}><Ico i={AlertTriangle} s={18} c={C.signal}/></div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,color:C.signal,fontSize:13,marginBottom:3}}>{overdue.length} overdue task{overdue.length>1?"s":""} — tap to view</div>
        <div style={{fontSize:11,color:C.muted}}>{overdue.slice(0,3).map(t=>t.title).join(" · ")}{overdue.length>3&&` · +${overdue.length-3} more`}</div>
      </div>
      <span style={{color:C.signal,fontSize:18}}>›</span>
    </div>}

    {role!=="owner"&&<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
      <StatCard label="Overdue"      value={overdue.length}  color={overdue.length>0?C.signal:C.greenL} iconC={AlertTriangle} onClick={()=>goTasks("Overdue")}/>
      <StatCard label="In Progress"  value={inprog.length}   color={C.amber}                             iconC={Wrench} onClick={()=>goTasks("In Progress")}/>
      <StatCard label="Pending"      value={pending.length}  color={C.muted}                             iconC={ClipboardList} onClick={()=>goTasks("Pending")}/>
      <StatCard label="Done"         value={done.length}     color={C.greenL}                            iconC={CheckCircle} onClick={()=>goTasks("Done")}/>
      {awaiting.length>0&&<StatCard label="Needs Approval" value={awaiting.length} color={C.purple} iconC={Clock} onClick={()=>goTasks("Awaiting Approval")}/>}
    </div>}

    {role==="owner"&&(()=>{
      // ── OWNER PANEL — fully wired, all navigation live ──────
      const overdueAssets   = (assets||[]).filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a)));
      const lowStockItems   = (inventory||[]).filter(i=>i.minQty>0&&i.qty<i.minQty);
      const criticalStock   = (inventory||[]).filter(i=>i.qty===0);
      const upcomingBookings= calEntries.filter(e=>e.type==="Booked"&&e.start>=TODAY).sort((a,b)=>a.start.localeCompare(b.start));
      const availableWindows= calEntries.filter(e=>e.type==="Available"&&e.end>=TODAY).sort((a,b)=>a.start.localeCompare(b.start));
      const onHold          = calEntries.filter(e=>e.type==="Hold"&&e.end>=TODAY);

      // SECTION HEADER component
      const SH = ({icon,iconC,label,link,linkLabel})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}>
          {iconC?<Ico i={iconC} s={13} c={C.muted}/>:<span>{icon}</span>}{label}
        </div>
        {link&&<button onClick={()=>setView(link)} style={{fontSize:11,color:C.brass,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>{linkLabel||"View all"} ›</button>}
      </div>;

      // STATUS ROW component — all clickable
      const StatusRow = ({icon,iconC,label,value,color,sub,onClick})=>(
        <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",marginBottom:7,transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=color+"66"}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{width:32,height:32,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {iconC?<Ico i={iconC} s={17} c={color}/>:<span style={{fontSize:18}}>{icon}</span>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{label}</div>
            {sub&&<div style={{fontSize:10,color:C.muted,marginTop:1}}>{sub}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:color}}>{value}</div>
          </div>
          <span style={{color:C.muted,fontSize:14}}>›</span>
        </div>
      );

      return <div>
        {/* ── YACHT STATUS ─────────────────────────────────── */}
        <div style={{background:`linear-gradient(135deg,${C.navy},#1e3a6e)`,border:`1px solid ${C.brassL}44`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{textAlign:"center",flexShrink:0}}>
              <ScoreRing value={health}/>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",marginTop:4,textTransform:"uppercase",letterSpacing:.8}}>Yacht Health</div>
              <div style={{fontSize:9,fontWeight:700,color:health>=80?C.greenL:health>=60?C.amber:C.signal,marginTop:2}}>
                {health>=80?"GOOD":health>=60?"ATTENTION":"ACTION NEEDED"}
              </div>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <ScoreRing value={readiness}/>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",marginTop:4,textTransform:"uppercase",letterSpacing:.8}}>Guest Ready</div>
              <div style={{fontSize:9,fontWeight:700,color:readiness>=80?C.greenL:readiness>=60?C.amber:C.signal,marginTop:2}}>
                {readiness>=80?"READY":readiness>=60?"MINOR ISSUES":"NOT READY"}
              </div>
            </div>
            <div style={{flex:1,minWidth:150}}>
              {readinessChecks.slice(0,4).map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:11,color:c.ok?C.greenL:C.signal,flexShrink:0}}>{c.ok?"✓":"✕"}</span>
                  <span style={{fontSize:11,color:c.ok?"rgba(255,255,255,0.9)":C.signal,lineHeight:1.2}}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CALENDAR / UPCOMING TRIPS ────────────────────── */}
        <SH iconC={Calendar} label="Calendar & Upcoming Trips" link="calendar" linkLabel="Open calendar"/>
        {upcomingBookings.length===0&&availableWindows.length===0&&onHold.length===0&&(
          <div onClick={()=>setView("calendar")} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:7,cursor:"pointer",textAlign:"center",color:C.muted,fontSize:12}}>
            {"No upcoming bookings — tap to view calendar ›"}
          </div>
        )}
        {upcomingBookings.slice(0,3).map(e=>{
          const nights=Math.max(0,Math.round((new Date(e.end)-new Date(e.start))/(1000*60*60*24)));
          return <div key={e.id} onClick={()=>setView("calendar")} style={{background:AVAIL_TYPES.Booked.bg,border:`1px solid ${AVAIL_TYPES.Booked.border}`,borderLeft:`3px solid ${AVAIL_TYPES.Booked.color}`,borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{e.start} → {e.end}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{nights} night{nights!==1?"s":""} · Tap to view calendar</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:AVAIL_TYPES.Booked.color,background:AVAIL_TYPES.Booked.bg,padding:"2px 8px",borderRadius:8}}>Booked</span>
            </div>
          </div>;
        })}
        {availableWindows.slice(0,2).map(e=>(
          <div key={e.id} onClick={()=>setView("calendar")} style={{background:AVAIL_TYPES.Available.bg,border:`1px solid ${AVAIL_TYPES.Available.border}`,borderLeft:`3px solid ${AVAIL_TYPES.Available.color}`,borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:AVAIL_TYPES.Available.color,display:"flex",alignItems:"center",gap:5}}><Ico i={CheckCircle} s={12} c={AVAIL_TYPES.Available.color}/>{"Available:"} {e.start} → {e.end}</div>
              <span style={{fontSize:13,color:C.muted}}>›</span>
            </div>
          </div>
        ))}
        {onHold.slice(0,1).map(e=>(
          <div key={e.id} onClick={()=>setView("calendar")} style={{background:AVAIL_TYPES.Hold.bg,border:`1px solid ${AVAIL_TYPES.Hold.border}`,borderLeft:`3px solid ${AVAIL_TYPES.Hold.color}`,borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:AVAIL_TYPES.Hold.color,display:"flex",alignItems:"center",gap:5}}><Ico i={Clock} s={12} c={AVAIL_TYPES.Hold.color}/>{"On Hold:"} {e.start} → {e.end}</div>
              <span style={{fontSize:13,color:C.muted}}>›</span>
            </div>
          </div>
        ))}

        {/* ── MAINTENANCE SUMMARY ──────────────────────────── */}
        <div style={{marginTop:16,marginBottom:0}}>
          <SH iconC={Wrench} label="Maintenance" link="maintenance" linkLabel="View all"/>
          <StatusRow
            iconC={Wrench} label="Assets Needing Service"
            value={overdueAssets.length} color={overdueAssets.filter(a=>assetServiceStatus(a)==="Overdue").length>0?C.signal:C.amber}
            sub={overdueAssets.length>0?overdueAssets.slice(0,2).map(a=>a.name).join(", ")+(overdueAssets.length>2?` +${overdueAssets.length-2} more`:""):"All assets serviced"}
            onClick={()=>setView("maintenance")}/>
          {overdueAssets.length>0&&overdueAssets.slice(0,3).map(a=>{
            const rem=hoursUntilService(a); const sc=rem<=0?C.signal:C.amber;
            return <div key={a.id} onClick={()=>setView("maintenance")}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.card,borderRadius:7,marginBottom:5,cursor:"pointer",border:`1px solid ${sc}33`}}>
              <span style={{fontSize:12,color:C.text}}>{a.name}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:600,color:sc}}>{rem<=0?`${Math.abs(rem)}h overdue`:`${rem}h`}</span>
                <span style={{fontSize:10,color:sc,background:`${sc}22`,padding:"2px 7px",borderRadius:8}}>{assetServiceStatus(a)}</span>
              </div>
            </div>;
          })}
        </div>

        {/* ── CREW SUMMARY ─────────────────────────────────── */}
        <div style={{marginTop:16}}>
          <SH iconC={Users} label="Crew" link="crew" linkLabel="View crew"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:7}}>
            {[
              {iconC:UserCheck,label:"Onboard",value:crewOnboard.length,color:C.greenL,sub:`of ${crew.length} total`},
              {iconC:Shield,label:"Cert Alerts",value:crewDocAlerts.length,color:crewDocAlerts.length>0?C.amber:C.greenL,sub:"Exp. or expiring"},
            ].map(({iconC:IC,label,value,color,sub})=>(
              <div key={label} onClick={()=>setView("crew")} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 13px",cursor:"pointer",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{marginBottom:6}}><Ico i={IC} s={18} c={color}/></div>
                <div style={{fontSize:18,fontWeight:800,color}}>{value}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.7}}>{label}</div>
                <div style={{fontSize:9,color:C.muted}}>{sub}</div>
              </div>
            ))}
          </div>
          {crew.slice(0,4).map(c=>(
            <div key={c.id} onClick={()=>setView("crew")} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,marginBottom:5,cursor:"pointer"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`${ROLES[c.role]?.color||C.muted}22`,border:`2px solid ${ROLES[c.role]?.color||C.muted}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <RoleIcon role={c.role} size={14}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.name}</div>
                <div style={{fontSize:10,color:C.muted}}>{ROLES[c.role]?.label} {c.onboard?"· Onboard":""}</div>
              </div>
              {c.docs.some(d=>["Expired","Expiring Soon"].includes(d.status))&&<Pill label="Cert alert" bg={C.amber+"22"} color={C.amber} small dot/>}
            </div>
          ))}
        </div>

        {/* ── INVENTORY SUMMARY ────────────────────────────── */}
        <div style={{marginTop:16}}>
          <SH iconC={Package} label="Inventory" link="inventory" linkLabel="View inventory"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:7}}>
            {[
              {iconC:MinusCircle,label:"Low Stock",value:lowStockItems.length,color:lowStockItems.length>0?C.amber:C.greenL,sub:"Below minimum"},
              {iconC:MinusCircle,label:"Out of Stock",value:criticalStock.length,color:criticalStock.length>0?C.signal:C.greenL,sub:"Zero remaining"},
            ].map(({iconC:IC,label,value,color,sub})=>(
              <div key={label} onClick={()=>setView("inventory")} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 13px",cursor:"pointer",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{marginBottom:6}}><Ico i={IC} s={18} c={color}/></div>
                <div style={{fontSize:18,fontWeight:800,color}}>{value}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.7}}>{label}</div>
                <div style={{fontSize:9,color:C.muted}}>{sub}</div>
              </div>
            ))}
          </div>
          {criticalStock.length>0&&criticalStock.slice(0,3).map(i=>(
            <div key={i.id} onClick={()=>setView("inventory")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:`${C.signal}10`,border:`1px solid ${C.signal}33`,borderRadius:7,marginBottom:5,cursor:"pointer"}}>
              <span style={{fontSize:12,color:C.text}}>{i.name}</span>
              <Pill label="Out of stock" bg={C.signal+"22"} color={C.signal} small dot/>
            </div>
          ))}
          {criticalStock.length===0&&lowStockItems.length>0&&lowStockItems.slice(0,3).map(i=>(
            <div key={i.id} onClick={()=>setView("inventory")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:`${C.amber}10`,border:`1px solid ${C.amber}33`,borderRadius:7,marginBottom:5,cursor:"pointer"}}>
              <span style={{fontSize:12,color:C.text}}>{i.name}</span>
              <Pill label="Low" bg={C.amber+"22"} color={C.amber} small dot/>
            </div>
          ))}
          {criticalStock.length===0&&lowStockItems.length===0&&<div style={{fontSize:12,color:C.greenL,padding:"8px 0"}}>✓ All inventory stocked</div>}
        </div>

        {/* ── CRITICAL TASKS (read-only view) ──────────────── */}
        {critical.length>0&&<div style={{marginTop:16}}>
          <SH iconC={AlertCircle} label="Critical Open Items" link={null}/>
          {critical.slice(0,4).map(t=>(
            <div key={t.id} style={{background:`${C.signal}10`,border:`1px solid ${C.signal}33`,borderLeft:`3px solid ${C.signal}`,borderRadius:8,padding:"10px 14px",marginBottom:7}}>
              <div style={{display:"flex",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                {pP(t.priority)}<Pill label={t.dept} bg={C.navyLight} color={C.muted} small/>
              </div>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{t.title}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{t.assignedTo} · {t.status}</div>
            </div>
          ))}
        </div>}

      </div>;
    })()}
    {["captain","management"].includes(role)&&<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
      <StatCard label="Crew Onboard"    value={`${crewOnboard.length}/${crew.length}`} color={C.greenL} iconC={Users} onClick={()=>goCrew("onboard")} sub="Tap to view crew"/>
      <StatCard label="Maintenance"      value={assets.filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a))).length} color={assets.filter(a=>assetServiceStatus(a)==="Overdue").length>0?C.signal:C.amber} iconC={Wrench} onClick={()=>setView("maintenance")} sub="Assets needing service"/>
      <StatCard label="Low Stock"        value={inventory.filter(i=>i.minQty>0&&i.qty<i.minQty).length} color={inventory.filter(i=>i.qty===0).length>0?C.signal:C.amber} iconC={Package} onClick={()=>setView("inventory")} sub="Inventory alerts"/>
      <StatCard label="Doc Alerts"      value={totalDocAlerts} color={totalDocAlerts>0?C.amber:C.greenL} iconC={FileText} onClick={()=>goDocs("expiring")} sub="Expiring or expired"/>
      <StatCard label="Crew Cert Alerts" value={crewDocAlerts.length} color={crewDocAlerts.length>0?C.amber:C.greenL} iconC={Shield} onClick={()=>goCrew("docalerts")} sub="Crew certificates"/>
      <StatCard label="Critical Tasks"  value={critical.length} color={critical.length>0?C.signal:C.greenL} iconC={AlertCircle} onClick={()=>goTasks("All","All","Critical")} sub="Needs action"/>
    </div>}

    {["captain","management"].includes(role)&&(expiredDocs.length>0||expiringDocs.length>0)&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:700,color:C.amber,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}><Ico i={FileText} s={12} c={C.amber}/>{"Document Expiry Alerts"}</div>
        <button onClick={()=>goDocs("expiring")} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>View all -></button>
      </div>
      {[...expiredDocs,...expiringDocs].slice(0,5).map(doc=>{
        const col=doc.status==="Expired"?C.signal:C.amber;
        return <div key={doc.id} onClick={()=>goDocs("expiring")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <span style={{fontSize:12,color:C.text}}>{doc.name}</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:10,color:C.muted}}>{doc.expiry?daysUntil(doc.expiry):""}</span>
            <Pill label={doc.status} bg={col+"22"} color={col} small dot/>
          </div>
        </div>;
      })}
    </div>}

    {critical.length>0&&<div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:700,color:C.signal,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}><Ico i={AlertCircle} s={12} c={C.signal}/>{"Critical — Action Required"}</div>
        <button onClick={()=>goTasks("All","All","Critical")} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>View all -></button>
      </div>
      {critical.slice(0,4).map(t=><MiniTaskRow key={t.id} task={t} onClick={()=>goTasks("All","All","Critical")}/>)}
    </div>}

    {["captain","management"].includes(role)&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Crew Task Status</div>
        <button onClick={()=>goCrew()} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Manage crew -></button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
        {["deckhand","stew","engineer","chef"].map(r=>{
          const rt=all.filter(t=>t.assignedTo===r);
          const ov=rt.filter(t=>t.status==="Overdue").length;
          const dn=rt.filter(t=>t.status==="Done").length;
          const pct=rt.length?Math.round((dn/rt.length)*100):0;
          const ri=ROLES[r];
          const deptFor={deckhand:"Deck",stew:"Interior",engineer:"Engineering",chef:"Galley"};
          return <div key={r} onClick={()=>goTasks("All",deptFor[r])}
            style={{background:C.card,border:`1px solid ${ov>0?C.signal+"44":C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ri.color+"88"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=ov>0?C.signal+"44":C.border}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${ri.color}22`,border:`2px solid ${ri.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <RoleIcon role={r} size={14}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{ri.label}</div>
              <div style={{fontSize:10,color:C.muted}}>{rt.length} tasks · {dn} done · {pct}% · tap to view</div>
            </div>
            {ov>0&&<Pill label={`${ov} overdue`} bg={C.signal+"22"} color={C.signal} small/>}
            <div style={{width:50,height:5,background:C.navyLight,borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:pct>80?C.green:pct>50?C.amber:C.signal,transition:"width .4s"}}/>
            </div>
            <span style={{color:C.muted,fontSize:14}}>›</span>
          </div>;
        })}
      </div>
    </div>}

    {/* Crew-role specific panels */}
    {role==="engineer"&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ico i={Wrench} s={12} c={C.blue}/>{"Engineering Status"}</div>
      {(assets||[]).filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a))).slice(0,4).map(a=>{
        const rem=hoursUntilService(a); const sc=rem<=0?C.signal:C.amber;
        return <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,color:C.text}}>{a.name}</span>
          <span style={{fontSize:11,fontWeight:600,color:sc}}>{rem<=0?`${Math.abs(rem)}hrs overdue`:`${rem}hrs`}</span>
        </div>;
      })}
      {(assets||[]).filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a))).length===0&&<div style={{fontSize:12,color:C.greenL}}>✓ All equipment current</div>}
      <button onClick={()=>setView("maintenance")} style={{...btn,background:"transparent",color:C.blue,padding:"6px 0",fontSize:11,border:"none",marginTop:8}}>View all assets -></button>
    </div>}

    {role==="stew"&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ico i={Star} s={12} c={C.purple}/>{"Interior & Guest Status"}</div>
      {(inventory||[]).filter(i=>i.category==="Guest Supplies"&&i.qty<i.minQty).map(i=>(
        <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,color:C.text}}>{i.name}</span>
          <Pill label={i.qty===0?"Out of stock":"Low"} bg={i.qty===0?C.signal+"22":C.amber+"22"} color={i.qty===0?C.signal:C.amber} small dot/>
        </div>
      ))}
      {(inventory||[]).filter(i=>i.category==="Guest Supplies"&&i.qty<i.minQty).length===0&&<div style={{fontSize:12,color:C.greenL}}>✓ Guest supplies stocked</div>}
      <button onClick={()=>setView("inventory")} style={{...btn,background:"transparent",color:C.purple,padding:"6px 0",fontSize:11,border:"none",marginTop:8}}>Check inventory -></button>
    </div>}

    {role==="chef"&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ico i={ChefHat} s={12} c={C.orange}/>{"Galley Status"}</div>
      {(inventory||[]).filter(i=>i.category==="Galley"&&i.qty<i.minQty).map(i=>(
        <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,color:C.text}}>{i.name}</span>
          <Pill label={i.qty===0?"Out of stock":"Low"} bg={i.qty===0?C.signal+"22":C.amber+"22"} color={i.qty===0?C.signal:C.amber} small dot/>
        </div>
      ))}
      {(inventory||[]).filter(i=>i.category==="Galley"&&i.qty<i.minQty).length===0&&<div style={{fontSize:12,color:C.greenL}}>✓ Galley stores good</div>}
      <button onClick={()=>setView("inventory")} style={{...btn,background:"transparent",color:C.orange,padding:"6px 0",fontSize:11,border:"none",marginTop:8}}>Check provisioning -></button>
    </div>}

    {role==="deckhand"&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ico i={Anchor} s={12} c={C.green}/>{"Deck Status"}</div>
      {mine.filter(t=>t.dept==="Deck"&&t.status==="Overdue").slice(0,4).map(t=>(
        <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,color:C.signal}}>{t.title}</span>
          <Pill label="Overdue" bg={C.signal+"22"} color={C.signal} small dot/>
        </div>
      ))}
      {mine.filter(t=>t.dept==="Deck"&&t.status==="Overdue").length===0&&<div style={{fontSize:12,color:C.greenL}}>✓ No overdue deck tasks</div>}
      <button onClick={()=>setView("tasks")} style={{...btn,background:"transparent",color:C.green,padding:"6px 0",fontSize:11,border:"none",marginTop:8}}>View my tasks -></button>
    </div>}

  </div>;
}

function MiniTaskRow({task,onClick}) {
  return <div onClick={onClick} style={{background:C.card,border:`1px solid ${task.priority==="Critical"?C.signal+"55":C.border}`,borderLeft:`3px solid ${task.priority==="Critical"?C.signal:C.amber}`,borderRadius:8,padding:"10px 14px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
    <div style={{flex:1}}>
      <div style={{display:"flex",gap:5,marginBottom:3}}>{pP(task.priority)}<Pill label={task.dept} bg={C.navyLight} color={C.muted} small/></div>
      <div style={{fontWeight:600,color:C.text,fontSize:13}}>{task.title}</div>
    </div>
    <div style={{flexShrink:0}}>{sP(task.status)}</div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// TASK MODULE — full CRUD, filters, detail, photo upload
// ═══════════════════════════════════════════════════════════════
const EMPTY_FORM = {title:"",desc:"",assignedTo:"deckhand",dept:"Deck",priority:"Medium",recurrence:"One-off",dueDate:TODAY,category:"Maintenance",notes:"",photos:[]};
const RECURRENCES = ["One-off","Daily","Weekly","Monthly","Bimonthly","Quarterly","6-Monthly","Annual"];
const PRIORITIES  = ["Critical","High","Medium","Low"];
const DEPARTMENTS = ["Engineering","Deck","Interior","Galley","Captain"];
const CATEGORIES  = ["Maintenance","Safety","Operations","Admin","Cleaning","Galley","Guest Care","Laundry","Inventory","Exterior","Equipment","Dive/Water","Compliance","Licensing","Navigation","HR","Owner Request","Appearance","Systems"];

// ══════════════════════════════════════════════════════════════
// TASK IMPORT — Excel / CSV upload + AI extraction + review
// ══════════════════════════════════════════════════════════════

async function parseFileForTasks(file) {
  // Returns raw text/rows from the file
  const ext = file.name.split('.').pop().toLowerCase();

  if(ext === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve({ type:'csv', text: e.target.result, name: file.name, size: file.size });
      reader.onerror = () => reject(new Error('Failed to read CSV'));
      reader.readAsText(file);
    });
  }

  if(ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          // Use SheetJS (available as XLSX in artifact env)
          const data  = new Uint8Array(e.target.result);
          const wb    = XLSX.read(data, {type:'array'});
          const ws    = wb.Sheets[wb.SheetNames[0]];
          const rows  = XLSX.utils.sheet_to_csv(ws);
          resolve({ type:'xlsx', text: rows, name: file.name, size: file.size, sheets: wb.SheetNames });
        } catch(err) {
          reject(new Error('Could not parse Excel file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel'));
      reader.readAsArrayBuffer(file);
    });
  }

  if(ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve({ type:'txt', text: e.target.result, name: file.name, size: file.size });
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  throw new Error('Unsupported file type. Use .xlsx, .xls, .csv or .txt');
}

async function extractTasksWithAI(fileData, departments, roles) {
  const prompt = `You are a yacht operations task manager. You have been given the contents of a task spreadsheet or schedule file.

FILE: ${fileData.name}
CONTENTS (CSV format):
${fileData.text.slice(0, 10000)}

Extract ALL tasks from this file. For each task row, extract:
- title: the task name/description (required)
- dept: map to one of: ${departments.join(', ')} — pick the closest match
- assignedTo: map to one of: ${roles.join(', ')} — pick the closest match based on department
- priority: one of Critical, High, Medium, Low — default Medium if unclear
- recurrence: one of One-off, Daily, Weekly, Monthly, Bimonthly, Quarterly, 6-Monthly, Annual — default One-off
- dueDate: in YYYY-MM-DD format if a date is mentioned, otherwise ""
- category: short category label e.g. "Maintenance", "Safety", "Cleaning", "Guest Prep", "Engineering"
- notes: any extra info from the row

Rules:
- Skip header rows, blank rows, total rows
- Skip rows that are clearly not tasks (section headers, instructions, comments)
- If a row has a task name but missing other fields, use sensible defaults
- Return ONLY valid JSON, no markdown, no explanation

Return a JSON array:
[
  {
    "title": "...",
    "dept": "...",
    "assignedTo": "...",
    "priority": "...",
    "recurrence": "...",
    "dueDate": "...",
    "category": "...",
    "notes": "..."
  }
]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  const raw  = data.content?.[0]?.text || '[]';
  const clean = raw.replace(/```json|```/g, '').trim();
  const tasks  = JSON.parse(clean);
  return Array.isArray(tasks) ? tasks : [];
}

function TaskImportModal({ onClose, onImport, role, tasks: existingTasks, setTasks, logAudit }) {
  const log = (a,d) => logAudit&&logAudit(a,d,'Tasks');
  const importRef = useRef(null);

  const [step,       setStep]       = useState('upload');  // upload | extracting | review | done
  const [error,      setError]      = useState(null);
  const [fileData,   setFileData]   = useState(null);      // parsed file content
  const [drafts,     setDrafts]     = useState([]);        // AI extracted tasks
  const [selected,   setSelected]   = useState(new Set()); // which drafts to import
  const [editing,    setEditing]    = useState(null);      // index of draft being edited
  const [editForm,   setEditForm]   = useState(null);

  const ROLE_OPTS = ['captain','management','engineer','stew','deckhand','chef'];

  async function handleFile(file) {
    if(!file) return;
    const allowed = ['xlsx','xls','csv','txt'];
    const ext = file.name.split('.').pop().toLowerCase();
    if(!allowed.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Use: .xlsx, .xls, .csv or .txt`);
      return;
    }
    setError(null);
    setStep('extracting');
    try {
      const parsed = await parseFileForTasks(file);
      setFileData(parsed);
      const extracted = await extractTasksWithAI(parsed, DEPARTMENTS, ROLE_OPTS);
      if(!extracted.length) throw new Error('No tasks found in file. Check the file has task rows.');
      setDrafts(extracted);
      setSelected(new Set(extracted.map((_,i)=>i)));
      setStep('review');
    } catch(e) {
      setError(e.message || 'Extraction failed');
      setStep('upload');
    }
  }

  function openEdit(idx) {
    setEditing(idx);
    setEditForm({...drafts[idx]});
  }
  function saveEdit() {
    setDrafts(p => p.map((d,i) => i===editing ? {...editForm} : d));
    setEditing(null); setEditForm(null);
  }
  function removeDraft(idx) {
    setDrafts(p => p.filter((_,i) => i!==idx));
    setSelected(prev => { const s = new Set(prev); s.delete(idx); return s; });
  }
  function toggleSelect(idx) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  }

  function importApproved() {
    const toCreate = drafts
      .filter((_,i) => selected.has(i))
      .map(d => ({
        ...EMPTY_FORM,
        ...d,
        id:          Date.now() + Math.random(),
        status:      'Pending',
        assignedBy:  role,
        completedAt: null,
        approvedBy:  null,
        importedFrom:fileData?.name || 'Import',
        importedAt:  new Date().toLocaleString('en-AE',{dateStyle:'short',timeStyle:'short'}),
      }));
    setTasks(p => [...p, ...toCreate]);
    log('Tasks Imported', `${toCreate.length} tasks imported from ${fileData?.name}`);
    setStep('done');
    setTimeout(() => onClose(), 1500);
  }

  const deptColor = d => ({Engineering:C.blue,Deck:C.greenL,Interior:C.purple,Galley:C.orange,Captain:C.brass}[d]||C.muted);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(7,16,31,.95)',zIndex:900,display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto'}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:'min(720px,96vw)',maxHeight:'90vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:'16px 20px 12px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <div style={{fontSize:16,fontWeight:800,color:C.navy}}>
              {step==='upload'&&'Import Tasks from File'}
              {step==='extracting'&&'Reading File…'}
              {step==='review'&&`Review ${drafts.length} Extracted Tasks`}
              {step==='done'&&'Import Complete'}
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:22}}>{'×'}</button>
          </div>
          {/* Step indicator */}
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {['Upload','Extract','Review','Import'].map((s,i)=>{
              const active = {upload:0,extracting:1,review:2,done:3}[step]>=i;
              return <div key={s} style={{display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:18,height:18,borderRadius:'50%',background:active?C.brass:C.navyLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:active?C.bg:C.muted}}>{i+1}</div>
                <span style={{fontSize:10,color:active?C.brass:C.muted}}>{s}</span>
                {i<3&&<span style={{color:C.border,fontSize:10}}>{'›'}</span>}
              </div>;
            })}
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'16px 20px 20px'}}>

          {/* ── UPLOAD STEP ── */}
          {step==='upload'&&<div>
            <div
              style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:'36px 20px',textAlign:'center',cursor:'pointer',background:C.navyLight,marginBottom:12}}
              onClick={()=>importRef.current?.click()}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.brass;}}
              onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;}}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;handleFile(e.dataTransfer.files[0]);}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={BarChart2} s={36} c={C.muted}/></div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{'Drop your task file here'}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{'Excel (.xlsx, .xls) · CSV · Text'}</div>
              <div style={{display:'inline-block',background:C.brass,color:C.bg,borderRadius:8,padding:'7px 18px',fontWeight:700,fontSize:12}}>{'Browse Files'}</div>
            </div>
            <input ref={importRef} type="file" accept=".xlsx,.xls,.csv,.txt" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
            {error&&<div style={{background:C.signal+'18',border:`1px solid ${C.signal}44`,borderRadius:8,padding:'9px 14px',fontSize:12,color:C.signal}}>{'⚠ '}{error}</div>}
            <div style={{background:C.navyLight,borderRadius:8,padding:'10px 14px',fontSize:11,color:C.muted,lineHeight:1.7}}>
              <div style={{fontWeight:700,color:C.text,marginBottom:4}}>{'What the AI looks for:'}</div>
              <div>{'• Task / job names and descriptions'}</div>
              <div>{'• Department assignments (Engineering, Deck, Interior, Galley)'}</div>
              <div>{'• Frequency or recurrence (Weekly, Monthly, Annual…)'}</div>
              <div>{'• Due dates or scheduled dates'}</div>
              <div>{'• Priority levels'}</div>
            </div>
          </div>}

          {/* ── EXTRACTING STEP ── */}
          {step==='extracting'&&<div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={Bot} s={36} c={C.brass}/></div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{'AI is reading your file…'}</div>
            <div style={{fontSize:12,color:C.muted}}>{'Identifying tasks · Extracting departments · Mapping schedules'}</div>
          </div>}

          {/* ── REVIEW STEP ── */}
          {step==='review'&&<div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
              <div style={{fontSize:12,color:C.muted}}>
                {`${selected.size} of ${drafts.length} tasks selected for import`}
                {fileData&&<span style={{marginLeft:8,color:C.text}}>{'from '}<strong>{fileData.name}</strong></span>}
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setSelected(new Set(drafts.map((_,i)=>i)))} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:'4px 10px',fontSize:11}}>{'Select all'}</button>
                <button onClick={()=>setSelected(new Set())} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:'4px 10px',fontSize:11}}>{'Deselect all'}</button>
              </div>
            </div>

            {/* Draft task list */}
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
              {drafts.map((draft,idx)=>{
                const sel = selected.has(idx);
                const isEdit = editing===idx;
                const dc = deptColor(draft.dept);
                return (
                  <div key={idx} style={{background:sel?C.navyLight:C.card,border:`1px solid ${sel?C.brass+'44':C.border}`,borderLeft:`3px solid ${sel?dc:C.border}`,borderRadius:9,padding:'10px 13px',opacity:sel?1:.55}}>
                    {isEdit ? (
                      /* Edit form inline */
                      <div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 10px',marginBottom:8}}>
                          <div style={{gridColumn:'1/-1',marginBottom:7}}>
                            <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:3}}>{'Task Title *'}</div>
                            <input value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))} style={{...inp,width:'100%',padding:'6px 9px',fontSize:12}}/>
                          </div>
                          {[
                            ['Department','dept', DEPARTMENTS],
                            ['Assigned To','assignedTo', ROLE_OPTS],
                            ['Priority','priority', PRIORITIES],
                            ['Recurrence','recurrence', RECURRENCES],
                          ].map(([label,key,opts])=>(
                            <div key={key} style={{marginBottom:7}}>
                              <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:3}}>{label}</div>
                              <select value={editForm[key]} onChange={e=>setEditForm(p=>({...p,[key]:e.target.value}))} style={{...inp,width:'100%',padding:'5px 8px',fontSize:11}}>
                                {opts.map(o=><option key={o}>{o}</option>)}
                              </select>
                            </div>
                          ))}
                          <div style={{marginBottom:7}}>
                            <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:3}}>{'Due Date'}</div>
                            <input type="date" value={editForm.dueDate||''} onChange={e=>setEditForm(p=>({...p,dueDate:e.target.value}))} style={{...inp,width:'100%',padding:'5px 8px',fontSize:11}}/>
                          </div>
                          <div style={{gridColumn:'1/-1',marginBottom:7}}>
                            <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:3}}>{'Notes'}</div>
                            <textarea value={editForm.notes||''} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} rows={2} style={{...inp,width:'100%',padding:'5px 8px',fontSize:11,resize:'vertical'}}/>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:7}}>
                          <button onClick={()=>{setEditing(null);setEditForm(null);}} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:'5px 0',fontSize:11}}>{'Cancel'}</button>
                          <button onClick={saveEdit} style={{...btn,flex:2,background:C.brass,color:C.bg,padding:'5px 0',fontSize:12,fontWeight:700}}>{'Save Changes'}</button>
                        </div>
                      </div>
                    ) : (
                      /* Display row */
                      <div style={{display:'flex',alignItems:'flex-start',gap:9}}>
                        <input type="checkbox" checked={sel} onChange={()=>toggleSelect(idx)} style={{marginTop:3,cursor:'pointer',flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1.3}}>{draft.title}</div>
                          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                            <span style={{fontSize:10,background:dc+'22',color:dc,padding:'2px 8px',borderRadius:8,fontWeight:700}}>{draft.dept}</span>
                            <span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:'2px 8px',borderRadius:8}}>{draft.assignedTo}</span>
                            <span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:'2px 8px',borderRadius:8}}>{draft.recurrence}</span>
                            {draft.priority&&<span style={{fontSize:10,background:({Critical:C.signal,High:C.orange,Medium:C.amber,Low:C.muted}[draft.priority]||C.muted)+'22',color:({Critical:C.signal,High:C.orange,Medium:C.amber,Low:C.muted}[draft.priority]||C.muted),padding:'2px 8px',borderRadius:8,fontWeight:700}}>{draft.priority}</span>}
                            {draft.dueDate&&<span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:'2px 8px',borderRadius:8}}>{daysUntil(draft.dueDate)}</span>}
                          </div>
                          {draft.notes&&<div style={{fontSize:10,color:C.muted,marginTop:4,fontStyle:'italic'}}>{draft.notes}</div>}
                        </div>
                        <div style={{display:'flex',gap:5,flexShrink:0}}>
                          <button onClick={()=>openEdit(idx)} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:'4px 9px',fontSize:11}}>{'✏️'}</button>
                          <button onClick={()=>removeDraft(idx)} style={{...btn,background:C.signal+'18',color:C.signal,border:`1px solid ${C.signal}33`,padding:'4px 9px',fontSize:11}}>{'✕'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Import button */}
            <button onClick={importApproved} disabled={selected.size===0}
              style={{...btn,width:'100%',background:selected.size>0?C.brass:C.navyLight,color:selected.size>0?C.bg:C.muted,padding:'12px 0',fontWeight:800,fontSize:14,opacity:selected.size>0?1:.6}}>
              {`Import ${selected.size} Task${selected.size!==1?'s':''} → Task List`}
            </button>
          </div>}

          {/* ── DONE ── */}
          {step==='done'&&<div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={CheckCircle} s={40} c={C.greenL}/></div>
            <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:6}}>{'Tasks imported successfully'}</div>
            <div style={{fontSize:12,color:C.muted}}>{'Closing…'}</div>
          </div>}

        </div>
      </div>
    </div>
  );
}

function TaskModule({tasks,setTasks,crew=[],role,user=null,initFilter,clearFilter,logAudit,showToast=()=>{}}) {
  const log=(action,detail)=>logAudit&&logAudit(action,detail,"Tasks");
  const [filter,setFilter]=useState(initFilter||{status:"All",priority:"All",dept:"All",recurrence:"All",search:""});
  const [showForm,setShowForm]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [detail,setDetail]=useState(null);
  const [form,setForm]=useState(EMPTY_FORM);
  const [bulk,setBulk]=useState([]);
  const [showImport,setShowImport]=useState(false);
  const fileRef=useRef(null);

  const canAssign=can(role,"canAssignTasks");
  const canApprove=can(role,"canApproveTasks");
  const isReadOnly=can(role,"readOnly");
  const isCaptainOrMgmt=["captain","management"].includes(role);
  // Tier-based permissions
  const myCrewRecord = crew.find(c=>c.id===user?.id) || crew.find(c=>c.role===role);
  const tier = isCaptainOrMgmt ? 1 : getCrewTier(crew, role, user?.id);
  const canCreateTask  = tier <= 3 && !isReadOnly && role!=="agent"; // all crew can create
  const canAssignOthers = tier <= 2 || canAssign; // tier1+2 can assign, tier3 self only
  const canReassign    = tier <= 2 || canAssign;
  const canDeleteTask  = tier === 1 || isCaptainOrMgmt;
  const isCrew = tier >= 2 && !isCaptainOrMgmt; // tiers 2+3 are crew
  // Dept scope for tier 2 — they can only assign within their dept
  const myDepts = myCrewRecord?.depts || [];

  useState(()=>{ if(initFilter) setFilter(initFilter); },[initFilter]);

  function visible(){
    return tasks.filter(t=>{
      // Role-based visibility
      if(role==="owner") return ["Critical","High"].includes(t.priority);
      if(!["management","captain"].includes(role)) {
        const myId = myCrewRecord?.id;
        // Tier 2 leads see ALL tasks in their dept (to manage/reassign)
        if(tier===2 && myDepts.length>0 && myDepts.some(d=>t.dept===d)) return true;
        // Self-created tasks always visible
        if(t.createdBy===role || (myId && t.createdBy===myId)) return true;
        // Tier 3 (and tier 2 for tasks outside their dept): only see tasks assigned to them specifically
        // Check if assigned to me: role match OR specific crew ID match
        const assignedToMe = t.assignedTo===role || 
          (myId && (t.assignedTo===myId || t.assignedToId===myId));
        if(!assignedToMe) return false;
      }
      // Filters
      if(filter.status!=="All"&&t.status!==filter.status) return false;
      if(filter.priority!=="All"&&t.priority!==filter.priority) return false;
      if(filter.dept!=="All"&&t.dept!==filter.dept) return false;
      if(filter.recurrence!=="All"&&t.recurrence!==filter.recurrence) return false;
      if(filter.search&&!t.title.toLowerCase().includes(filter.search.toLowerCase())&&!t.desc.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }

  function openForm(task){
    setEditTask(task||null);
    const base = task?{...task}:{...EMPTY_FORM};
    // Crew self-assign — pre-fill with their own role
    if(!task && !canAssign && tier>=2) {
      base.assignedTo = role;
      base.dept = myDepts[0] || base.dept;
      base.createdBy = role;
    }
    setForm(base);
    setShowForm(true);
  }

  function save(){
    if(!form.title) return;
    if(editTask){
      setTasks(p=>p.map(t=>t.id===editTask.id?{...t,...form}:t));
      log("Task Updated",`${form.title} — edited by ${ROLES[role]?.label}`);
      showToast("Task updated","✓","success");
    } else {
      setTasks(p=>[...p,{...form,id:Date.now(),assignedBy:role,status:"Pending",completedAt:null,approvedBy:null}]);
      log("Task Assigned",`${form.title} -> ${ROLES[form.assignedTo]?.label} (${form.priority}, due ${form.dueDate})`);
      showToast("Task created","✓","success");
    }
    setShowForm(false);
    setDetail(null);
  }

  // Tasks requiring Captain/Officer approval before closing
  const APPROVAL_CATEGORIES = ["Safety","Dive/Water","Compliance","Licensing"];
  function needsApproval(task) {
    return task.priority==="Critical" || APPROVAL_CATEGORIES.includes(task.category);
  }

  function setStatus(id,status){
    const t=tasks.find(x=>x.id===id);
    setTasks(p=>p.map(t=>t.id===id?{...t,status,completedAt:status==="Done"?TODAY:t.completedAt}:t));
    if(detail?.id===id) setDetail(p=>({...p,status,completedAt:status==="Done"?TODAY:p.completedAt}));
    const actionMap={"Done":"Task Completed","In Progress":"Task Started","Awaiting Approval":"Task Submitted","Overdue":"Task Overdue"};
    if(t) log(actionMap[status]||"Task Updated",`${t.title} — marked ${status}`);
  }

  function approve(id){
    const t=tasks.find(x=>x.id===id);
    setTasks(p=>p.map(t=>t.id===id?{...t,status:"Done",approvedBy:role,completedAt:t.completedAt||TODAY}:t));
    if(t) log("Task Approved",`${t.title} — approved by ${ROLES[role]?.label}`);
    showToast("Task approved","check","success");
    setDetail(null);
  }

  function del(id,title){
    setTasks(p=>p.filter(t=>t.id!==id)); setDetail(null); setShowForm(false);
    log("Task Deleted",`${title} — deleted by ${ROLES[role]?.label}`);
  }
  function reassign(id, crewId){
    const t = tasks.find(x=>x.id===id);
    const crewMember = crew.find(c=>c.id===crewId) || crew.find(c=>c.role===crewId);
    const newRole = crewMember?.role || crewId;
    const newDept = crewMember?.depts?.[0] || ({deckhand:"Deck",stew:"Interior",engineer:"Engineering",chef:"Galley",captain:"Captain"}[newRole]) || t?.dept;
    // Store both role (for broad matching) and crewId (for specific matching)
    setTasks(p=>p.map(t=>t.id===id?{...t,assignedTo:newRole,assignedToId:crewId,assignedToName:crewMember?.name||"",dept:newDept||t.dept}:t));
    setDetail(p=>p?{...p,assignedTo:newRole,assignedToId:crewId,assignedToName:crewMember?.name||""}:p);
    if(t) log("Task Reassigned",`${t.title} -> ${crewMember?.name||ROLES[newRole]?.label}`);
    showToast(`Reassigned to ${crewMember?.name||ROLES[newRole]?.label}`,"↗","success");
  }

  function addPhoto(e){
    Array.from(e.target.files).forEach(f=>{
      const r=new FileReader(); r.onload=ev=>setForm(p=>({...p,photos:[...p.photos,ev.target.result]})); r.readAsDataURL(f);
    });
  }

  const [bulkAssignTo,setBulkAssignTo]=useState("deckhand");
  function bulkAct(action){
    const titles=tasks.filter(t=>bulk.includes(t.id)).map(t=>t.title);
    if(action==="complete"){
      const APPROVAL_CATS = ["Safety","Dive/Water","Compliance","Licensing"];
      let approved=0, pending=0;
      setTasks(p=>p.map(t=>{
        if(!bulk.includes(t.id)) return t;
        const needsApproval = t.priority==="Critical"||APPROVAL_CATS.includes(t.category);
        if(needsApproval){ pending++; return {...t,status:"Awaiting Approval"}; }
        approved++;
        return {...t,status:"Done",completedAt:TODAY};
      }));
      log("Task Completed",`${bulk.length} tasks bulk-completed by ${ROLES[role]?.label}`);
      haptic("success");
      const msg = pending>0&&approved>0
        ? `${approved} completed · ${pending} sent for approval`
        : pending>0 ? `${pending} submitted for approval` : `${approved} task${approved>1?"s":""} completed`;
      showToast(msg,"✓","success");
    }
    if(action==="pending"){
      setTasks(p=>p.map(t=>bulk.includes(t.id)?{...t,status:"Pending",completedAt:null}:t));
      log("Task Updated",`${bulk.length} tasks reset to Pending by ${ROLES[role]?.label}`);
    }
    if(action==="delete"){
      setTasks(p=>p.filter(t=>!bulk.includes(t.id)));
      log("Task Deleted",`${bulk.length} tasks bulk-deleted by ${ROLES[role]?.label}`);
    }
    if(action==="reassign"){
      const bCrew=crew.find(c=>c.role===bulkAssignTo); const bDept=bCrew?.depts?.[0]||({deckhand:"Deck",stew:"Interior",engineer:"Engineering",chef:"Galley",captain:"Captain"}[bulkAssignTo]); setTasks(p=>p.map(t=>bulk.includes(t.id)?{...t,assignedTo:bulkAssignTo,dept:bDept||t.dept}:t));
      log("Task Reassigned",`${bulk.length} tasks bulk-reassigned -> ${ROLES[bulkAssignTo]?.label}`);
    }
    setBulk([]);
  }

  const [sortBy,setSortBy]=useState("dueDate");
  const vt=visible().sort((a,b)=>{
    if(sortBy==="dueDate") return a.dueDate.localeCompare(b.dueDate);
    if(sortBy==="priority") return ["Critical","High","Medium","Low"].indexOf(a.priority)-["Critical","High","Medium","Low"].indexOf(b.priority);
    if(sortBy==="title") return a.title.localeCompare(b.title);
    return 0;
  });

  const statGroups=["Overdue","Awaiting Approval","In Progress","Pending","Done"];
  const REC_ORDER=["Daily","Weekly","Monthly","Bimonthly","Quarterly","6-Monthly","Annual","One-off"];
  const grouped = {};
  vt.forEach(t=>{ const g=t.status; if(!grouped[g]) grouped[g]=[]; grouped[g].push(t); });

  return <div>
    {/* Header */}
    {/* Task header — title row + buttons row, no overflow */}
    <div style={{marginBottom:14}}>
      {/* Row 1: checkbox + title */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        {canAssign&&!isReadOnly&&<input type="checkbox" title="Select all"
          checked={bulk.length===vt.length&&vt.length>0}
          onChange={()=>setBulk(bulk.length===vt.length?[]:vt.map(t=>t.id))}
          style={{cursor:"pointer",width:16,height:16,flexShrink:0}}/>}
        <div style={{fontSize:18,fontWeight:800,color:C.navy}}>
          Tasks <span style={{color:C.muted,fontSize:14,fontWeight:400}}>({vt.length})</span>
          {bulk.length>0&&<span style={{fontSize:11,color:C.brass,marginLeft:10}}>{bulk.length} selected</span>}
        </div>
      </div>
      {/* Row 2: action buttons — full width, side by side */}
      {canCreateTask&&<div style={{display:"flex",gap:8}}>
        {canAssign&&<button onClick={()=>setShowImport(true)}
          style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,fontSize:13,padding:"9px 0"}}>
          {"Import"}
        </button>}
        <button onClick={()=>openForm(null)}
          style={{...btn,flex:2,background:C.brass,color:C.bg,fontSize:13,fontWeight:700,padding:"9px 0"}}>
          {isCaptainOrMgmt?"+ Assign Task":tier===2?"+ Add Task":"+ Add My Task"}
        </button>
      </div>}
    </div>

    {/* Filters */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
      <input value={filter.search} onChange={e=>setFilter(p=>({...p,search:e.target.value}))} placeholder="Search tasks…" style={{...inp,width:190,padding:"6px 10px",fontSize:12}}/>
      {[{k:"status",opts:["All","Pending","In Progress","Awaiting Approval","Overdue","Done"]},
        {k:"priority",opts:["All","Critical","High","Medium","Low"]},
        {k:"dept",opts:["All","Engineering","Deck","Interior","Galley","Captain"]},
        {k:"recurrence",opts:["All","Daily","Weekly","Monthly","Quarterly","Annual","One-off"]},
      ].map(({k,opts})=>(
        <select key={k} value={filter[k]} onChange={e=>setFilter(p=>({...p,[k]:e.target.value}))}
          style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
          {opts.map(o=><option key={o}>{o}</option>)}
        </select>
      ))}
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none",borderColor:C.brass+"66"}}>
        {[["dueDate","Sort: Due Date"],["priority","Sort: Priority"],["title","Sort: A–Z"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
      {(filter.status!=="All"||filter.priority!=="All"||filter.dept!=="All"||filter.search)&&
        <button onClick={()=>setFilter({status:"All",priority:"All",dept:"All",recurrence:"All",search:""})}
          style={{...btn,background:C.signal+"22",color:C.signal,padding:"4px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear</button>}
    </div>

    {/* Bulk actions */}
    {bulk.length>0&&!isReadOnly&&<div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.brass,fontWeight:700,minWidth:80}}>{bulk.length} selected</div>
      <div style={{width:1,height:20,background:C.border}}/>
      <button onClick={()=>bulkAct("complete")} style={{...btn,background:C.green,color:"white",padding:"5px 12px",fontSize:11}}>✓ Complete</button>
      <button onClick={()=>bulkAct("pending")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:11}}>Reset Pending</button>
      <div style={{width:1,height:20,background:C.border}}/>
      {isCaptainOrMgmt&&<>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <select value={bulkAssignTo} onChange={e=>setBulkAssignTo(e.target.value)}
            style={{...inp,width:"auto",padding:"4px 8px",fontSize:11,flex:"none"}}>
            {crew.filter(c=>!["owner","management","agent"].includes(c.role)).map(c=>(
              <option key={c.id} value={c.role}>{c.name}</option>
            ))}
            {crew.filter(c=>!["owner","management","agent"].includes(c.role)).length===0&&
              Object.keys(ROLES).filter(r=>!["owner","management","agent"].includes(r)).map(r=>(
                <option key={r} value={r}>{ROLES[r].icon} {ROLES[r].label}</option>
              ))
            }
          </select>
          <button onClick={()=>bulkAct("reassign")} style={{...btn,background:C.blue+"22",color:C.blue,padding:"5px 12px",fontSize:11,border:`1px solid ${C.blue}44`}}>{"Reassign"}</button>
        </div>
        <div style={{width:1,height:20,background:C.border}}/>
        <button onClick={()=>bulkAct("delete")} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 12px",fontSize:11,border:`1px solid ${C.signal}44`}}>{"Delete"}</button>
      </>}
      <button onClick={()=>setBulk([])} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 12px",fontSize:11}}>✕ Clear</button>
    </div>}

    {vt.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:C.muted}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={32} c={C.muted}/></div>{"No tasks match this filter."}</div>}

    {statGroups.map(group=>{
      const gt=(grouped[group]||[]).sort((a,b)=>REC_ORDER.indexOf(a.recurrence)-REC_ORDER.indexOf(b.recurrence));
      if(!gt.length) return null;
      const gCol={Overdue:C.signal,"Awaiting Approval":C.purple,Critical:C.signal,"In Progress":C.amber,Pending:C.muted,Done:C.greenL}[group];
      return <div key={group} style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:5,borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:gCol,flexShrink:0}}/>
          <span style={{fontSize:11,fontWeight:700,color:gCol,textTransform:"uppercase",letterSpacing:1}}>{group}</span>
          <span style={{fontSize:11,color:C.muted}}>({gt.length})</span>
        </div>
        {gt.map(t=><TaskRow key={t.id} task={t} role={role} isReadOnly={isReadOnly}
          selected={bulk.includes(t.id)} onSelect={id=>setBulk(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])}
          onOpen={()=>setDetail(t)} onStatus={setStatus} onApprove={approve}/>)}
      </div>;
    })}

    {/* Task Form */}
    {showImport&&<TaskImportModal
      onClose={()=>setShowImport(false)}
      role={role}
      tasks={tasks}
      setTasks={setTasks}
      logAudit={logAudit}
    />}

    {showForm&&<Modal title={editTask?"Edit Task":isCaptainOrMgmt?"Assign New Task":tier===2?"Add Task":"Add My Task"} onClose={()=>setShowForm(false)} width={600}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <div style={{gridColumn:"1/-1"}}>
          <FF label="Task Title" value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} req ph="What needs to be done?"/>
        </div>
        <div style={{gridColumn:"span 1"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Assign To *</div>
          {tier===3
            ? <div style={{...inp,width:"100%",padding:"8px 10px",fontSize:12,opacity:.7,background:C.navyLight,color:C.muted}}>
                {crew.find(c=>c.role===role)?.name||ROLES[role]?.label} (You)
              </div>
            : <select value={form.assignedTo} onChange={e=>setForm(p=>({...p,assignedTo:e.target.value}))}
                style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}>
                {crew.filter(c=>{
                  if(["owner","management","agent"].includes(c.role)) return false;
                  // Tier 2 can only assign within their own depts
                  if(tier===2&&myDepts.length>0) return (c.depts||[]).some(d=>myDepts.includes(d))||c.role===role;
                  return true;
                }).map(c=>(
                  <option key={c.id} value={c.role}>{c.name} ({c.position})</option>
                ))}
                {crew.filter(c=>!["owner","management","agent"].includes(c.role)).length===0&&
                  Object.keys(ROLES).filter(r=>!["owner","management","agent"].includes(r)).map(r=>(
                    <option key={r} value={r}>{ROLES[r].icon} {ROLES[r].label}</option>
                  ))
                }
              </select>
          }
        </div>
        {/* Dept — locked for crew (tier 2+3), editable for captain/mgmt */}
        {tier<=1||isCaptainOrMgmt
          ? <FF label="Department" type="select" value={form.dept} onChange={v=>setForm(p=>({...p,dept:v}))} half opts={DEPARTMENTS}/>
          : <div style={{gridColumn:"span 1"}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Department</div>
              <div style={{...inp,width:"100%",padding:"8px 10px",fontSize:12,opacity:.7,background:C.navyLight,color:C.muted}}>
                {myDepts[0]||form.dept}
              </div>
            </div>
        }
        <FF label="Priority" type="select" value={form.priority} onChange={v=>setForm(p=>({...p,priority:v}))} half opts={PRIORITIES}/>
        <FF label="Recurrence" type="select" value={form.recurrence} onChange={v=>setForm(p=>({...p,recurrence:v}))} half opts={RECURRENCES}/>
        <FF label="Category" type="select" value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} half opts={CATEGORIES}/>
        <FF label="Due Date" type="date" value={form.dueDate} onChange={v=>setForm(p=>({...p,dueDate:v}))} half/>
        <FF label="Description / Instructions" type="textarea" value={form.desc} onChange={v=>setForm(p=>({...p,desc:v}))} ph="Details, tools, safety notes…" rows={3}/>
        <FF label="Notes" type="textarea" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} rows={2}/>
      </div>
      {/* Photo upload */}
      <div style={{marginBottom:16}}>
        <label style={lbl}>Attach Photos</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={()=>fileRef.current.click()} style={{...btn,background:C.navyLight,border:`1px dashed ${C.border}`,color:C.muted,padding:"6px 14px",fontSize:12}}>📷 Add Photo</button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={addPhoto} style={{display:"none"}}/>
          {form.photos.map((ph,i)=><div key={i} style={{position:"relative"}}>
            <img src={ph} alt="" style={{width:54,height:42,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
            <button onClick={()=>setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-4,right:-4,background:C.signal,border:"none",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,cursor:"pointer",lineHeight:"14px",textAlign:"center"}}>×</button>
          </div>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:8,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
        <button onClick={()=>{haptic("medium");save();}} style={{...btn,flex:2,background:C.brass,color:C.bg,padding:"10px 0",fontWeight:700}}>
          {editTask?"Save Changes":tier===3?"Submit My Task":tier===2?"Submit Task":"Save Task"}
        </button>
        <button onClick={()=>setShowForm(false)} style={{...btn,flex:1,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"10px 0"}}>Cancel</button>
        {editTask&&isCaptainOrMgmt&&<button onClick={()=>del(editTask.id,editTask.title)} style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`}}>{"Delete"}</button>}
      </div>
    </Modal>}

    {/* Task Detail */}
    {detail&&<TaskDetail task={detail} role={role} onClose={()=>setDetail(null)}
      onEdit={()=>{setDetail(null);openForm(detail);}} onStatus={setStatus} onApprove={approve} onDelete={del} onReassign={reassign} crew={crew} canDeleteTask={canDeleteTask} tier={tier} myCrewRecord={myCrewRecord} showToast={showToast}/>}
    {["captain","management"].includes(role)&&<FloatingAI label="Task Generator" icon="clipboard" color={C.purple}><AITaskGeneratorModule tasks={tasks} setTasks={setTasks} crew={[]} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

function TaskRow({task,role,selected,onSelect,onOpen,onStatus,onApprove,isReadOnly}) {
  const [hover,setHover]=useState(false);
  const overdue=task.status==="Overdue";
  const isCaptainOrMgmt=["management","captain"].includes(role);
  const canEdit=isCaptainOrMgmt&&!isReadOnly;
  const sc=overdue?C.signal:task.status==="Done"?C.greenL:task.status==="In Progress"?C.amber:C.border;
  return <div style={{background:hover?C.cardHover:C.card,border:`1px solid ${overdue?C.signal+"44":C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:8,padding:"11px 14px",marginBottom:7,transition:"background .12s",display:"flex",alignItems:"center",gap:10,userSelect:"none"}}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
    {!isReadOnly&&<div
      onClick={e=>{e.stopPropagation();onSelect(task.id);}}
      style={{flexShrink:0,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:6,background:selected?"#c9a84c22":"transparent"}}>
      <input type="checkbox" checked={selected} readOnly
        style={{width:16,height:16,cursor:"pointer",pointerEvents:"none"}}/>
    </div>}
    {/* Task content — tap this to open detail */}
    <div style={{flex:1,minWidth:0,cursor:"pointer",display:"flex",alignItems:"center",gap:8}} onClick={onOpen}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4,alignItems:"center"}}>
          {pP(task.priority)}
          <Pill label={task.recurrence} bg={C.navyLight} color={C.muted} small/>
          <Pill label={task.category} bg={C.navyLight} color={C.muted} small/>
          {task.importedFrom&&<Pill label={"Import"} bg={C.blue+"22"} color={C.blue} small/>}
          {task.photos&&task.photos.length>0&&<span style={{fontSize:10,color:C.muted,display:'flex',alignItems:'center',gap:2}}><Ico i={Camera} s={10} c={C.muted}/>{task.photos.length}</span>}
        </div>
        <div style={{fontWeight:600,color:C.text,fontSize:13,lineHeight:1.3}}>{task.title}</div>
        {task.notes&&<div style={{fontSize:11,color:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.notes}</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0,marginLeft:6}}>
        <span style={{fontSize:10,color:overdue?C.signal:C.muted,whiteSpace:"nowrap"}}>{daysUntil(task.dueDate)}</span>
        {sP(task.status)}
        {task.status==="Awaiting Approval"&&["captain","management"].includes(role)&&
          <button onClick={e=>{e.stopPropagation();haptic("success");onApprove(task.id);}} style={{...btn,background:C.green,color:"white",padding:"3px 10px",fontSize:10}}>Approve</button>}
        {canEdit&&task.status!=="Done"&&task.status!=="Awaiting Approval"&&<select
          value={task.status} onClick={e=>e.stopPropagation()}
          onChange={e=>{e.stopPropagation();onStatus(task.id,e.target.value);}}
          style={{background:C.navyLight,border:`1px solid ${C.border}`,color:C.text,borderRadius:5,padding:"2px 6px",fontSize:10,cursor:"pointer"}}>
          {["Pending","In Progress","Done","Awaiting Approval","Overdue"].map(s=><option key={s}>{s}</option>)}
        </select>}
      </div>
    </div>
  </div>;
}

function TaskDetail({task,role,onClose,onEdit,onStatus,onApprove,onDelete,onReassign,crew=[],canDeleteTask=false,tier=3,myCrewRecord=null,showToast=()=>{}}) {
  const canEdit=["management","captain"].includes(role);
  const isCrew=!canEdit&&!can(role,"readOnly")&&role!=="agent";
  const isMine=role===task.assignedTo;
  const [showReassign,setShowReassign]=useState(false);
  const notDone=task.status!=="Done"&&task.status!=="Awaiting Approval";

  return <Modal title="Task Detail" onClose={onClose} width={560}>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {pP(task.priority)}{sP(task.status)}
      <Pill label={task.recurrence} bg={C.navyLight} color={C.muted}/>
      <Pill label={task.dept} bg={C.navyLight} color={C.muted}/>
      <Pill label={task.category} bg={C.navyLight} color={C.muted}/>
    </div>
    <div style={{fontWeight:800,fontSize:16,color:C.navy,marginBottom:8,lineHeight:1.3}}>{task.title}</div>
    {task.desc&&<div style={{color:C.text,fontSize:13,marginBottom:14,lineHeight:1.7,background:C.navyLight,borderRadius:8,padding:"10px 12px"}}>{task.desc}</div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
      {[["Assigned To",getAssigneeName(task.assignedTo,crew,task)],["Assigned By",getAssigneeName(task.assignedBy,crew)],["Due Date",task.dueDate+" ("+daysUntil(task.dueDate)+")"],["Category",task.category],["Completed",task.completedAt||"—"],["Approved By",task.approvedBy||"—"],...(task.importedFrom?[["Imported From",task.importedFrom+" · "+task.importedAt]]:[])].map(([k,v])=>(
        <div key={k} style={{background:C.navyLight,borderRadius:6,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2}}>{k}</div>
          <div style={{fontSize:12,color:C.text,fontWeight:600}}>{v}</div>
        </div>
      ))}
    </div>
    {task.notes&&<div style={{background:C.navyLight,borderRadius:6,padding:"8px 10px",marginBottom:12,fontSize:12,color:C.muted}}>{task.notes}</div>}
    {task.photos&&task.photos.length>0&&<div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
      {task.photos.map((ph,i)=><img key={i} src={ph} alt="" style={{width:96,height:72,objectFit:"cover",borderRadius:7,border:`1px solid ${C.border}`}}/>)}
    </div>}
    {(canEdit||tier<=2)&&showReassign&&task.status!=="Done"&&task.status!=="Awaiting Approval"&&<div style={{background:C.navyLight,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>
        {"Reassign to"}{tier===2&&" (your department only)"}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {(crew.length>0
          ? crew.filter(c=>{
              if(["owner","management","agent"].includes(c.role)) return false;
              if(c.id===myCrewRecord?.id) return false; // exclude self
              if(tier===2) {
                // Only show lower-tier crew in same dept
                const myDeptList = myCrewRecord?.depts||[];
                const sameDept = (c.depts||[]).some(d=>myDeptList.includes(d));
                if(!sameDept) return false;
                // Exclude same or higher tier (leads reassign DOWN only)
                const theirTier = getCrewTier(crew, c.role, c.id);
                return theirTier > tier; // only show tier 3 crew
              }
              return true;
            })
          : Object.keys(ROLES).filter(r=>!["owner","management","agent"].includes(r)&&r!==role).map(r=>({role:r,name:ROLES[r].label,position:ROLES[r].label}))
        ).map(c=>(
          <button key={c.id||c.role} onClick={()=>{onReassign(task.id,c.id||c.role);setShowReassign(false);onClose();}}
            style={{...btn,background:(task.assignedToId===c.id||task.assignedTo===c.role)?C.brass:C.card,color:(task.assignedToId===c.id||task.assignedTo===c.role)?C.bg:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:12}}>
            {c.name}
            {c.position&&c.position!==c.name&&<span style={{fontSize:9,color:(task.assignedToId===c.id)?C.bg+"aa":C.muted,marginLeft:4}}>({c.position})</span>}
          </button>
        ))}
      </div>
    </div>}
    {can(role,"readOnly")&&<div style={{background:C.brass+"15",border:`1px solid ${C.brass}33`,borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.brass}}>{"Owner view — read-only. Contact your Captain to make changes."}</div>}
    {isCrew&&isMine&&notDone&&<div style={{background:C.navyLight,borderRadius:10,padding:"14px",marginBottom:10}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{"Update Task Status"}</div>
      {(task.priority==="Critical"||["Safety","Dive/Water","Compliance","Licensing"].includes(task.category))&&<div style={{fontSize:10,color:C.amber,marginBottom:10,lineHeight:1.5}}>
        {task.priority==="Critical"?"Critical task":"Safety-related task"}{"  — requires Captain or Officer approval before closing."}
      </div>}
      <div style={{display:"flex",gap:8}}>
        {task.status!=="In Progress"&&<button onClick={()=>{haptic("light");onStatus(task.id,"In Progress");onClose();}}
          style={{...btn,flex:1,background:C.amber+"22",color:C.amber,border:`1px solid ${C.amber}44`,padding:"10px 0",fontWeight:700}}>
          {"▶ Start Task"}
        </button>}
        <button onClick={()=>{
            const requires = task.priority==="Critical"||["Safety","Dive/Water","Compliance","Licensing"].includes(task.category);
            haptic("success");
            onStatus(task.id, requires?"Awaiting Approval":"Done");
            showToast(requires?"Submitted for approval":"Task completed","✓","success");
            onClose();
          }}
          style={{...btn,flex:1,background:C.greenL+"22",color:C.greenL,border:`1px solid ${C.greenL}44`,padding:"10px 0",fontWeight:700}}>
          {"Complete Task"}
        </button>
      </div>
    </div>}
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {canEdit&&<button onClick={onEdit} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>{"Edit"}</button>}
      {(canEdit||tier<=2)&&task.status!=="Done"&&task.status!=="Awaiting Approval"&&<button onClick={()=>setShowReassign(p=>!p)} style={{...btn,background:showReassign?C.brass+"33":C.navyLight,color:showReassign?C.brass:C.muted,border:`1px solid ${C.border}`}}>{"Reassign"}</button>}
      {canEdit&&notDone&&<>
        {task.status!=="In Progress"&&<button onClick={()=>{onStatus(task.id,"In Progress");}} style={{...btn,background:C.amber+"22",color:C.amber}}>{"▶ Start"}</button>}
        <button onClick={()=>{haptic("success");onStatus(task.id,"Done");showToast("Task completed","✓","success");onClose();}} style={{...btn,background:C.green,color:"white"}}>{"✓ Complete"}</button>
      </>}
      {task.status==="Awaiting Approval"&&canEdit&&<button onClick={()=>{haptic("success");onApprove(task.id);onClose();}} style={{...btn,background:C.purple,color:"white"}}>{"Approve"}</button>}
      {(canEdit||canDeleteTask)&&<button onClick={()=>onDelete(task.id,task.title)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto",border:`1px solid ${C.signal}44`}}><span style={{display:"flex",alignItems:"center",gap:5}}><Trash2 size={13} strokeWidth={2}/>Delete</span></button>}
    </div>
  </Modal>;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — CREW MODULE
// ═══════════════════════════════════════════════════════════════

const DOC_TYPES = [
  // Mandatory — All Crew
  "Passport",
  "Seaman's Book",
  "ENG1 Medical Certificate",
  "STCW Basic Safety Training",
  "STCW Fire Fighting & Prevention",
  "STCW Sea Survival",
  "STCW Elementary First Aid",
  "STCW Personal Safety (PSSR)",
  "STCW Security Awareness (PDSD)",
  // Command & Deck
  "Certificate of Competency (CoC) — Master",
  "Certificate of Competency (CoC) — OOW",
  "RYA Yachtmaster Offshore",
  "RYA Yachtmaster Ocean",
  "IYT Master of Yachts",
  "STCW Advanced Fire Fighting",
  "STCW Proficiency Survival Craft (PSCRB)",
  "GMDSS Radio Operator Licence",
  "Ship Security Officer (SSO)",
  "Radar / ARPA Certificate",
  "Powerboat Level 2",
  // Engineering
  "Certificate of Competency (CoC) — Engineer",
  "GMDSS Maintainer Certificate",
  "Refrigeration & Air Conditioning",
  "High Voltage Certificate",
  "Engineer Watch Rating",
  // Interior & Galley
  "Food Safety & Hygiene (Level 2)",
  "Food Safety & Hygiene (Level 3)",
  "HACCP Certificate",
  "Allergen Awareness Certificate",
  "GUEST Housekeeping Certificate",
  "GUEST Service Certificate",
  "Wine & Beverage (WSET)",
  // First Aid
  "First Aid Certificate",
  "CPR Certificate",
  "Advanced First Aid / MFA",
  // Visas & Work Permits
  "Visa — US B1/B2",
  "Visa — Schengen",
  "Visa — UAE Residence",
  "Work Permit",
  "Flag State Endorsement",
  // Watersports & Diving
  "PADI / SSI Dive Certification",
  "Dive Rescue Certificate",
  "Jet Ski Licence",
  "Watersports Instructor Certificate",
  "Powerboat / Tender Operator",
  // Other
  "Yellow Fever Vaccination",
  "Covid / Health Certificate",
  "Other",
];

const INIT_CREW = [
  { id:"c1", name:"Captain", position:"Captain", depts:["Command"], notifCats:["task","maintenance","document","inventory","enquiry","brief","compliance"], nationality:"South African", phone:"+971 58 920 4430", email:"captain@vessel.com", emergencyContact:"Maria — +27 82 000 0001", startDate:"2023-01-15", contractEnd:"2027-01-15", salary:"", role:"captain", avatar:"CA", onboard:true, notes:"Master 500GT. 15 years experience Gulf and Med.", docs:[
    {id:"cd1",type:"Passport",number:"A123456",issued:"2019-03-10",expiry:d(380),status:"Valid",file:null},
    {id:"cd2",type:"Master CoC",number:"MCA-M500-001",issued:"2021-06-01",expiry:d(420),status:"Valid",file:null},
    {id:"cd3",type:"STCW Basic Safety",number:"STCW-2021-001",issued:"2021-06-01",expiry:d(365),status:"Valid",file:null},
    {id:"cd4",type:"ENG1 Medical",number:"ENG1-2024-001",issued:"2024-01-10",expiry:d(22),status:"Expiring Soon",file:null},
  ]},
  { id:"c2", name:"Chief Engineer", position:"Chief Engineer", depts:["Engineering"], notifCats:["task","maintenance","inventory"], nationality:"Irish", phone:"+971 50 123 4567", email:"engineer@vessel.com", emergencyContact:"Patrick — +353 87 000 0002", startDate:"2023-03-01", contractEnd:"2027-03-01", salary:"", role:"engineer", avatar:"CE", onboard:true, notes:"Volvo Penta specialist. Also qualified on MTU.", docs:[
    {id:"cd5",type:"Passport",number:"B234567",issued:"2020-05-14",expiry:d(290),status:"Valid",file:null},
    {id:"cd6",type:"Chief Engineer CoC",number:"MCA-CE-002",issued:"2022-04-01",expiry:d(500),status:"Valid",file:null},
    {id:"cd7",type:"ENG1 Medical",number:"ENG1-2024-002",issued:"2024-03-01",expiry:d(60),status:"Valid",file:null},
  ]},
  { id:"c3", name:"Stew", position:"Chief Stewardess", depts:["Interior"], notifCats:["task","inventory"], nationality:"Russian", phone:"+971 55 234 5678", email:"stew@vessel.com", emergencyContact:"Natasha — +7 900 000 0003", startDate:"2024-01-10", contractEnd:"2026-07-10", salary:"", role:"stew", avatar:"ST", onboard:true, notes:"Wine qualified. Trained at GUEST.", docs:[
    {id:"cd8",type:"Passport",number:"C345678",issued:"2018-11-20",expiry:d(-5),status:"Expired",file:null},
    {id:"cd9",type:"STCW Basic Safety",number:"STCW-2022-003",issued:"2022-08-01",expiry:d(200),status:"Valid",file:null},
    {id:"cd10",type:"ENG1 Medical",number:"ENG1-2023-003",issued:"2023-06-01",expiry:d(8),status:"Expiring Soon",file:null},
  ]},
  { id:"c4", name:"Deckhand", position:"Deckhand", depts:["Deck"], notifCats:["task"], nationality:"South African", phone:"+971 52 345 6789", email:"deck@vessel.com", emergencyContact:"John — +27 82 000 0004", startDate:"2024-06-01", contractEnd:"2025-12-01", salary:"", role:"deckhand", avatar:"DH", onboard:true, notes:"Divemaster. Jet ski and tender certified.", docs:[
    {id:"cd11",type:"Passport",number:"D456789",issued:"2021-02-10",expiry:d(400),status:"Valid",file:null},
    {id:"cd12",type:"STCW Basic Safety",number:"STCW-2023-004",issued:"2023-01-15",expiry:d(12),status:"Expiring Soon",file:null},
  ]},
  { id:"c5", name:"Chef", position:"Head Chef", depts:["Galley"], notifCats:["task","inventory"], nationality:"German", phone:"+971 54 456 7890", email:"chef@vessel.com", emergencyContact:"Klaus — +49 170 000 0005", startDate:"2024-02-15", contractEnd:"2027-02-15", salary:"", role:"chef", avatar:"CH", onboard:false, notes:"Michelin-trained. Specialist in Mediterranean and Asian cuisine.", docs:[
    {id:"cd13",type:"Passport",number:"E567890",issued:"2022-07-01",expiry:d(600),status:"Valid",file:null},
    {id:"cd14",type:"Food Safety Certificate",number:"FSC-2023-005",issued:"2023-03-01",expiry:d(88),status:"Expiring Soon",file:null},
  ]},
  // Owner record — needed for onboard/ashore toggle on owner dashboard
  { id:"c_owner", name:"Owner", position:"Owner", depts:[], notifCats:[], nationality:"", phone:"", email:"", emergencyContact:"", startDate:"", contractEnd:"", salary:"", role:"owner", avatar:"OW", onboard:true, notes:"", docs:[] },
];

function docExpiryStatus(expiry) {
  if(!expiry) return "Unknown";
  const days=Math.ceil((new Date(expiry)-new Date(new Date().toDateString()))/86400000);
  if(days<0)   return "Expired";
  if(days<=30) return "Expiring Soon";
  if(days<=90) return "Expiring Soon";
  return "Valid";
}

function docExpiryColor(status) {
  if(status==="Expired")       return C.signal;
  if(status==="Expiring Soon") return C.amber;
  return C.greenL;
}

function CrewModule({crew,setCrew,role,initFilter,logAudit,showToast=()=>{}}) {
  const logC=(action,detail)=>logAudit&&logAudit(action,detail,"Crew");
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editMember,setEditMember]=useState(null);
  const [showDocForm,setShowDocForm]=useState(false);
  const [editDoc,setEditDoc]=useState(null); // doc being edited (for renewal)
  const [docTarget,setDocTarget]=useState(null);
  const [search,setSearch]=useState("");
  const [roleFilter,setRoleFilter]=useState("All");
  const [onboardFilter,setOnboardFilter]=useState(initFilter==="onboard"?"Onboard":initFilter==="docalerts"?"Doc Alerts":"All");
  const [sortBy,setSortBy]=useState("name");
  const [bulkCrew,setBulkCrew]=useState([]);
  const canEdit=can(role,"canManageCrew");

  function bulkCrewAct(action){
    if(action==="onboard")  { setCrew(p=>p.map(c=>bulkCrew.includes(c.id)?{...c,onboard:true}:c));  logC&&logC("Crew Updated",`${bulkCrew.length} crew marked Onboard`); }
    if(action==="ashore")   { setCrew(p=>p.map(c=>bulkCrew.includes(c.id)?{...c,onboard:false}:c)); logC&&logC("Crew Updated",`${bulkCrew.length} crew marked Ashore`); }
    if(action==="delete"){
      setCrew(p=>p.filter(c=>!bulkCrew.includes(c.id)));
      logC&&logC("Crew Deleted",`${bulkCrew.length} crew members bulk-archived`);
    }
    setBulkCrew([]);
  }

  const EMPTY_MEMBER={name:"",position:"",nationality:"",phone:"",email:"",emergencyContact:"",startDate:"",contractEnd:"",salary:"",role:"deckhand",depts:[],notifCats:[],onboard:true,notes:"",docs:[],accessLevel:""};
  const EMPTY_DOC={type:"Passport",number:"",issued:"",expiry:"",status:"Valid",file:null,customName:""};
  const [mForm,setMForm]=useState(EMPTY_MEMBER);
  const [dForm,setDForm]=useState(EMPTY_DOC);

  const allDocAlerts=crew.flatMap(c=>c.docs.filter(d=>["Expired","Expiring Soon"].includes(d.status)).map(d=>({...d,crewName:c.name,crewId:c.id})));

  const filtered=crew.filter(c=>{
    if(c.role==="owner") return false; // owner is not displayed in crew list
    if(search&&!c.name.toLowerCase().includes(search.toLowerCase())&&!c.position.toLowerCase().includes(search.toLowerCase())&&!c.nationality.toLowerCase().includes(search.toLowerCase())) return false;
    if(roleFilter!=="All"&&c.role!==roleFilter) return false;
    if(onboardFilter==="Onboard"&&!c.onboard) return false;
    if(onboardFilter==="Ashore"&&c.onboard) return false;
    if(onboardFilter==="Doc Alerts"&&!c.docs.some(d=>["Expired","Expiring Soon"].includes(d.status))) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="name") return a.name.localeCompare(b.name);
    if(sortBy==="role") return a.role.localeCompare(b.role);
    if(sortBy==="contract") return (a.contractEnd||"").localeCompare(b.contractEnd||"");
    return 0;
  });

  function openMemberForm(m) {
    setEditMember(m||null);
    setMForm(m?{...m}:{...EMPTY_MEMBER});
    setShowForm(true);
  }

  function saveMember() {
    if(!mForm.name) return;
    const avatar=mForm.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    // Default accessLevel based on position if not set
    const accessLevel = mForm.accessLevel || (
      TASK_TIER_1.includes(mForm.position) ? "full" :
      TASK_TIER_2.includes(mForm.position) ? "lead" : "standard"
    );
    if(editMember){
      setCrew(p=>p.map(c=>c.id===editMember.id?{...c,...mForm,accessLevel,avatar}:c));
      logC("Crew Updated",`${mForm.name} — profile updated`);
      showToast(`${mForm.name} updated`,"user","success");
    } else {
      setCrew(p=>[...p,{...mForm,accessLevel,id:`c${Date.now()}`,avatar,docs:[]}]);
      logC("Crew Added",`${mForm.name} added as ${ROLES[mForm.role]?.label}`);
      showToast(`${mForm.name} added to crew`,"user","success");
    }
    setShowForm(false);
  }

  function deleteMember(id,name) {
    setCrew(p=>p.filter(c=>c.id!==id)); setSelected(null); setShowForm(false);
    logC("Crew Deleted",`${name} — archived from system`);
  }

  function openDocForm(crewId) { setDocTarget(crewId); setEditDoc(null); setDForm({...EMPTY_DOC}); setShowDocForm(true); }
  function openEditDoc(crewId, doc) { setDocTarget(crewId); setEditDoc(doc); setDForm({...doc}); setShowDocForm(true); }

  function saveDoc() {
    if(!dForm.type) return;
    if(dForm.type==="Other"&&!dForm.customName?.trim()) return;
    const displayType = dForm.type==="Other"&&dForm.customName?.trim() ? dForm.customName.trim() : dForm.type;
    const status=docExpiryStatus(dForm.expiry);
    const crewMember=crew.find(c=>c.id===docTarget);
    if(editDoc) {
      const updated={...dForm,type:displayType,status};
      setCrew(p=>p.map(c=>c.id===docTarget?{...c,docs:c.docs.map(d=>d.id===editDoc.id?updated:d)}:c));
      setSelected(prev=>prev&&prev.id===docTarget?{...prev,docs:prev.docs.map(d=>d.id===editDoc.id?updated:d)}:prev);
      logC("Crew Doc Updated",`${crewMember?.name||"Crew"} — ${displayType} renewed (exp: ${dForm.expiry||"none"})`);
      showToast(`${displayType} updated`,"file","success");
    } else {
      const newDoc={...dForm,type:displayType,id:`cd${Date.now()}`,status};
      setCrew(p=>p.map(c=>c.id===docTarget?{...c,docs:[...c.docs,newDoc]}:c));
      setSelected(prev=>prev&&prev.id===docTarget?{...prev,docs:[...prev.docs,newDoc]}:prev);
      logC("Crew Doc Added",`${crewMember?.name||"Crew"} — ${displayType} added (exp: ${dForm.expiry||"none"})`);
      showToast(`${displayType} added`,"file","success");
    }
    setShowDocForm(false);
    setEditDoc(null);
  }

  function deleteDoc(crewId,docId) {
    setCrew(p=>p.map(c=>c.id===crewId?{...c,docs:c.docs.filter(d=>d.id!==docId)}:c));
    setSelected(prev=>prev&&prev.id===crewId?{...prev,docs:prev.docs.filter(d=>d.id!==docId)}:prev);
  }

  function toggleOnboard(id) { setCrew(p=>p.map(c=>c.id===id?{...c,onboard:!c.onboard}:c)); }

  const InfoGrid=({pairs})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
    {pairs.map(([k,v])=><div key={k} style={{background:C.navyLight,borderRadius:7,padding:"8px 10px"}}>
      <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2}}>{k}</div>
      <div style={{fontSize:12,color:C.text,fontWeight:600,wordBreak:"break-word"}}>{v||"—"}</div>
    </div>)}
  </div>;

  const hasFilters=search||roleFilter!=="All"||onboardFilter!=="All";

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {canEdit&&<input type="checkbox" title="Select all"
          checked={bulkCrew.length===filtered.length&&filtered.length>0}
          onChange={()=>setBulkCrew(bulkCrew.length===filtered.length?[]:filtered.map(c=>c.id))}
          style={{cursor:"pointer",width:16,height:16}}/>}
        <div>


      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Crew <span style={{color:C.muted,fontSize:14,fontWeight:400}}>({filtered.length}/{crew.filter(c=>c.role!=="owner").length})</span></div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{crew.filter(c=>c.onboard&&c.role!=="owner").length} onboard · {crew.filter(c=>!c.onboard&&c.role!=="owner").length} ashore{bulkCrew.length>0&&` · ${bulkCrew.length} selected`}</div>
        </div>
      </div>
      {canEdit&&<button onClick={()=>openMemberForm(null)} style={{...btn,background:C.brass,color:C.bg}}>+ Add Crew</button>}
    </div>

    {/* Crew bulk action bar */}
    {bulkCrew.length>0&&canEdit&&<div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.brass,fontWeight:700}}>{bulkCrew.length} crew selected</div>
      <div style={{width:1,height:20,background:C.border}}/>
      <button onClick={()=>bulkCrewAct("onboard")} style={{...btn,background:C.green+"22",color:C.greenL,padding:"5px 12px",fontSize:11,border:`1px solid ${C.green}44`}}>Mark Onboard</button>
      <button onClick={()=>bulkCrewAct("ashore")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:11}}>Mark Ashore</button>
      <div style={{width:1,height:20,background:C.border}}/>
      <button onClick={()=>bulkCrewAct("delete")} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 12px",fontSize:11,border:`1px solid ${C.signal}44`}}>Archive Selected</button>
      <button onClick={()=>setBulkCrew([])} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 12px",fontSize:11}}>✕ Clear</button>
    </div>}

    {/* Filter bar */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, position, nationality…"
        style={{...inp,width:220,padding:"6px 10px",fontSize:12}}/>
      <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        <option value="All">All Roles</option>
        {Object.keys(ROLES).map(r=><option key={r} value={r}>{ROLES[r].icon} {ROLES[r].label}</option>)}
      </select>
      {["All","Onboard","Ashore","Doc Alerts"].map(f=><button key={f} onClick={()=>setOnboardFilter(f)}
        style={{...btn,background:onboardFilter===f?C.brass:C.navyLight,color:onboardFilter===f?C.bg:C.muted,border:`1px solid ${onboardFilter===f?C.brass:C.border}`,padding:"5px 12px",fontSize:11}}>{f}</button>)}
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none",borderColor:C.brass+"55"}}>
        {[["name","Sort: Name"],["role","Sort: Role"],["contract","Sort: Contract"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
      {hasFilters&&<button onClick={()=>{setSearch("");setRoleFilter("All");setOnboardFilter("All");}}
        style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear</button>}
    </div>

    {/* Document alert banner */}
    {allDocAlerts.length>0&&<div style={{background:`${C.signal}10`,border:`1px solid ${C.signal}44`,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
      <div style={{fontWeight:700,color:C.signal,fontSize:13,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico i={AlertTriangle} s={13} c={C.signal}/>{"Document Alerts ("}{allDocAlerts.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {allDocAlerts.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:i<allDocAlerts.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:12,color:C.text}}><b style={{color:C.navy}}>{d.crewName}</b> — {d.type}</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:C.muted}}>{d.expiry?`Exp: ${d.expiry}`:""}</span>
            <Pill label={d.status} bg={d.status==="Expired"?`${C.signal}22`:`${C.amber}22`} color={d.status==="Expired"?C.signal:C.amber} small dot/>
          </div>
        </div>)}
      </div>
    </div>}

    {/* Crew cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
      {filtered.map(c=>{
        const alerts=c.docs.filter(d=>d.status==="Expired"||d.status==="Expiring Soon").length;
        const ri=ROLES[c.role]||ROLES.deckhand;
        const isSelected=bulkCrew.includes(c.id);
        return <div key={c.id} style={{background:isSelected?C.navyMid:C.card,border:`1px solid ${isSelected?C.brass:alerts>0?C.amber+"55":C.border}`,borderRadius:10,padding:16,cursor:"pointer",transition:"border-color .15s, background .15s",position:"relative"}}
          onClick={()=>bulkCrew.length>0?setBulkCrew(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id]):setSelected(c)}
          onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.borderColor=ri.color+"88"; }}
          onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.borderColor=alerts>0?C.amber+"55":C.border; }}>
          {canEdit&&<div style={{position:"absolute",top:10,right:10}} onClick={e=>{e.stopPropagation();setBulkCrew(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id]);}}>
            <input type="checkbox" checked={isSelected} readOnly style={{cursor:"pointer"}}/>
          </div>}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:`${ri.color}22`,border:`2px solid ${ri.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:ri.color,flexShrink:0}}>{c.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:C.text,fontSize:14}}>{c.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{c.position}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c.onboard?C.greenL:C.muted}}/>
              <span style={{fontSize:9,color:c.onboard?C.greenL:C.muted}}>{c.onboard?"Onboard":"Ashore"}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            <Pill label={ri.label} bg={`${ri.color}22`} color={ri.color} small dot/>
            {(c.depts||[]).map(d=><Pill key={d} label={d} bg={C.blue+"18"} color={C.blue} small/>)}
            <Pill label={c.nationality} bg={C.navyLight} color={C.muted} small/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:C.muted}}>Contract: {c.contractEnd||"—"}</span>
            {alerts>0&&<Pill label={`${alerts} doc alert${alerts>1?"s":""}`} bg={`${C.amber}22`} color={C.amber} small/>}
          </div>
        </div>;
      })}
    </div>

    {/* Crew detail modal */}
    {selected&&<Modal title={selected.name} onClose={()=>setSelected(null)} width={580}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:`${(ROLES[selected.role]||ROLES.deckhand).color}22`,border:`2px solid ${(ROLES[selected.role]||ROLES.deckhand).color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:(ROLES[selected.role]||ROLES.deckhand).color}}>{selected.avatar}</div>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:C.navy}}>{selected.position}</div>
          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
            <Pill label={(ROLES[selected.role]||ROLES.deckhand).label} bg={`${(ROLES[selected.role]||ROLES.deckhand).color}22`} color={(ROLES[selected.role]||ROLES.deckhand).color} small dot/>
            {(()=>{const isOnboard=crew.find(c=>c.id===selected.id)?.onboard??selected.onboard; return <Pill label={isOnboard?"Onboard":"Ashore"} bg={isOnboard?`${C.greenL}22`:`${C.muted}22`} color={isOnboard?C.greenL:C.muted} small dot/>;})()}
            {(selected.depts||[]).map(d=><Pill key={d} label={d} bg={C.blue+"22"} color={C.blue} small/>)}
            <Pill label={selected.nationality} bg={C.navyLight} color={C.muted} small/>
          </div>
        </div>
        {canEdit&&(()=>{
          const isOnboard = crew.find(c=>c.id===selected.id)?.onboard ?? selected.onboard;
          return <button
            onClick={()=>{
              haptic("light");
              toggleOnboard(selected.id);
              setSelected(prev=>prev?{...prev,onboard:!prev.onboard}:prev);
            }}
            style={{...btn,marginLeft:"auto",padding:"6px 14px",fontSize:11,fontWeight:700,
              background:isOnboard?`${C.signal}22`:`${C.green}22`,
              color:isOnboard?C.signal:C.greenL,
              border:`1px solid ${isOnboard?C.signal+"44":C.green+"44"}`,
              transition:"all .2s"}}>
            {isOnboard?"Mark Ashore":"Mark Onboard"}
          </button>;
        })()}
      </div>

      <InfoGrid pairs={[["Phone",selected.phone],["Email",selected.email],["Nationality",selected.nationality],["Start Date",selected.startDate],["Contract End",selected.contractEnd],["Emergency Contact",selected.emergencyContact]].filter(([k])=>k!=="Emergency Contact"||canEdit)}/>

      {selected.notes&&<div style={{background:C.navyLight,borderRadius:7,padding:"8px 10px",marginBottom:14,fontSize:12,color:C.muted}}>📝 {selected.notes}</div>}

      {/* Documents */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Documents ({selected.docs.length})</div>
          {canEdit&&<button onClick={()=>openDocForm(selected.id)} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"3px 10px",fontSize:10}}>+ Add Doc</button>}
        </div>
        {selected.docs.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"12px 0"}}>No documents uploaded yet.</div>}
        {selected.docs.map(doc=>{
          const sc=docExpiryColor(doc.status);
          return <div key={doc.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.navyLight,borderRadius:7,marginBottom:6,borderLeft:`3px solid ${sc}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{doc.type}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{doc.number&&`#${doc.number}`}{doc.issued&&` · Issued: ${doc.issued}`}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              {doc.expiry&&<div style={{fontSize:11,color:sc,fontWeight:600}}>Exp: {doc.expiry}</div>}
              <div style={{marginTop:3}}><Pill label={doc.status} bg={`${sc}22`} color={sc} small dot/></div>
            </div>
            {canEdit&&<div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
              <button onClick={()=>openEditDoc(selected.id,doc)} style={{...btn,background:C.brass+"22",color:C.brass,padding:"2px 8px",fontSize:9,border:`1px solid ${C.brass}33`,borderRadius:5}}>{"✏ Renew"}</button>
              <button onClick={()=>deleteDoc(selected.id,doc.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:"0",lineHeight:1}}>×</button>
            </div>}
          </div>;
        })}
      </div>

      {canEdit&&<div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setSelected(null);openMemberForm(selected);}} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Edit Profile</button>
        <button onClick={()=>deleteMember(selected.id,selected.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Archive Crew</button>
      </div>}
    </Modal>}

    {/* Add/Edit crew form */}
    {showForm&&<Modal title={editMember?"Edit Crew Member":"Add Crew Member"} onClose={()=>setShowForm(false)} width={580}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <FF label="Full Name" value={mForm.name} onChange={v=>setMForm(p=>({...p,name:v}))} req ph="Full legal name"/>
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Position *</div>
          <select value={mForm.position} onChange={e=>{
            const pos=e.target.value;
            const info=getPositionInfo(pos);
            const defaultAccess = TASK_TIER_1.includes(pos)?"full":TASK_TIER_2.includes(pos)?"lead":"standard";
            setMForm(p=>({...p,position:pos,role:info?info.role:p.role,depts:info?info.depts:[],notifCats:info?info.notifCats:[],accessLevel:p.accessLevel||defaultAccess}));
          }} style={{...inp,width:"100%",padding:"8px 11px",fontSize:12}}>
            <option value="">{"— Select position —"}</option>
            {["COMMAND","ENGINEERING","DECK","INTERIOR","GALLEY","WELLNESS","HYBRID"].map(grp=>(
              <optgroup key={grp} label={grp}>
                {CREW_POSITIONS.filter(cp=>{
                  const grpMap={COMMAND:["Command"],ENGINEERING:["Engineering"],DECK:["Deck"],INTERIOR:["Interior"],GALLEY:["Galley"],WELLNESS:["Interior"],HYBRID:["Deck","Interior","Engineering"]};
                  const grpDepts=grpMap[grp]||[];
                  if(grp==="HYBRID") return cp.depts.length>1;
                  if(grp==="WELLNESS") return cp.depts.length===1&&grpDepts.some(d=>cp.depts.includes(d))&&["Spa Therapist","Masseuse","Nanny / Childcare","Personal Trainer","Security Officer","Dive Instructor","Watersports Instructor"].includes(cp.position);
                  return cp.depts.length===1&&grpDepts.some(d=>cp.depts.includes(d))&&!["Spa Therapist","Masseuse","Nanny / Childcare","Personal Trainer","Security Officer","Dive Instructor","Watersports Instructor"].includes(cp.position);
                }).map(cp=>(
                  <option key={cp.position} value={cp.position}>{cp.position}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {mForm.position&&getPositionInfo(mForm.position)&&<div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:C.muted}}>Auto-assigned:</span>
            {getPositionInfo(mForm.position).depts.map(d=><span key={d} style={{fontSize:10,background:C.blue+"22",color:C.blue,padding:"1px 8px",borderRadius:6,fontWeight:700}}>{d}</span>)}
            <span style={{fontSize:10,background:C.brass+"22",color:C.brass,padding:"1px 8px",borderRadius:6,fontWeight:700}}>{ROLES[getPositionInfo(mForm.position).role]?.label}</span>
          </div>}
        </div>
        {/* Access Level — plain language, Captain-granted */}
        {mForm.position&&<div style={{gridColumn:"1/-1",marginBottom:4}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>System Access Level</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ACCESS_LEVELS.map(al=>{
              const isSelected = (mForm.accessLevel||"standard")===al.value;
              const defaultAccess = TASK_TIER_1.includes(mForm.position)?"full":TASK_TIER_2.includes(mForm.position)?"lead":"standard";
              const isDefault = defaultAccess===al.value;
              return <div key={al.value}
                onClick={()=>setMForm(p=>({...p,accessLevel:al.value}))}
                style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 14px",borderRadius:10,cursor:"pointer",
                  background:isSelected?`${al.color}18`:C.navyLight,
                  border:`2px solid ${isSelected?al.color:C.border}`,
                  transition:"all .15s"}}>
                <div style={{flexShrink:0,width:22,height:22,borderRadius:6,marginTop:1,
                  background:isSelected?al.color:C.navyMid,
                  border:`2px solid ${isSelected?al.color:C.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,transition:"all .15s"}}>
                  {isSelected&&<span style={{color:"white",fontWeight:900,fontSize:12}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:isSelected?al.color:C.navy,display:"flex",alignItems:"center",gap:5}}><Ico i={al.IconC} s={13} c={isSelected?al.color:C.navy}/>{al.label}</span>
                    {isDefault&&<span style={{fontSize:9,background:`${C.brass}22`,color:C.brass,padding:"1px 7px",borderRadius:5,fontWeight:700}}>DEFAULT FOR THIS POSITION</span>}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:3,lineHeight:1.5}}>{al.desc}</div>
                </div>
              </div>;
            })}
          </div>
        </div>}
        <FF label="Nationality" value={mForm.nationality} onChange={v=>setMForm(p=>({...p,nationality:v}))} half/>
        <FF label="Phone" value={mForm.phone} onChange={v=>setMForm(p=>({...p,phone:v}))} half/>
        <FF label="Email" value={mForm.email} onChange={v=>setMForm(p=>({...p,email:v}))} half/>
        <FF label="Start Date" type="date" value={mForm.startDate} onChange={v=>setMForm(p=>({...p,startDate:v}))} half/>
        <FF label="Contract End" type="date" value={mForm.contractEnd} onChange={v=>setMForm(p=>({...p,contractEnd:v}))} half/>
        <FF label="Emergency Contact" value={mForm.emergencyContact} onChange={v=>setMForm(p=>({...p,emergencyContact:v}))} ph="Name and phone"/>
        <FF label="Notes" type="textarea" value={mForm.notes} onChange={v=>setMForm(p=>({...p,notes:v}))} rows={2}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <input type="checkbox" id="ob" checked={mForm.onboard} onChange={e=>setMForm(p=>({...p,onboard:e.target.checked}))}/>
        <label htmlFor="ob" style={{fontSize:13,color:C.muted,cursor:"pointer"}}>Currently onboard</label>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={saveMember} style={{...btn,background:C.brass,color:C.bg}}>Save</button>
        <button onClick={()=>setShowForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
        {editMember&&<button onClick={()=>deleteMember(editMember.id,editMember.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
      </div>
    </Modal>}

    {/* Add document form */}
    {showDocForm&&<Modal title={editDoc?"Renew / Edit Document":"Add Document"} onClose={()=>{setShowDocForm(false);setEditDoc(null);}} width={440}>
      <FF label="Document Type" type="select" value={dForm.type} onChange={v=>setDForm(p=>({...p,type:v,customName:""}))} opts={DOC_TYPES}/>
      {dForm.type==="Other"&&<FF label="Document Name *" value={dForm.customName||""} onChange={v=>setDForm(p=>({...p,customName:v}))} ph="e.g. Sommelier Certificate, Flag State Endorsement…"/>}
      <FF label="Document / Certificate Number" value={dForm.number} onChange={v=>setDForm(p=>({...p,number:v}))} ph="e.g. MCA-0012345"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <FF label="Issue Date" type="date" value={dForm.issued} onChange={v=>setDForm(p=>({...p,issued:v}))} half/>
        <FF label="Expiry Date" type="date" value={dForm.expiry} onChange={v=>setDForm(p=>({...p,expiry:v}))} half/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={saveDoc} style={{...btn,background:C.brass,color:C.bg}}>Add Document</button>
        <button onClick={()=>setShowDocForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
      </div>
    </Modal>}
    {["captain","management"].includes(role)&&<FloatingAI label="Crew Management" icon="users" color={C.purple}><AIReadinessModule tasks={[]} crew={crew} docs={[]} assets={[]} inventory={[]} logbook={[]} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — DOCUMENTS VAULT
// ═══════════════════════════════════════════════════════════════

const INIT_DOCS = [
  {id:"d1",name:"Vessel Registration",category:"Vessel",expiry:d(210),status:"Valid",uploadedDate:d(-365),size:"2.1 MB",type:"PDF",notes:""},
  {id:"d2",name:"Hull & P&I Insurance",category:"Vessel",expiry:d(38),status:"Expiring Soon",uploadedDate:d(-327),size:"4.8 MB",type:"PDF",notes:"Renewal quote requested from broker."},
  {id:"d3",name:"Ship Radio Station Licence",category:"Vessel",expiry:d(23),status:"Expiring Soon",uploadedDate:d(-342),size:"1.2 MB",type:"PDF",notes:"Submit renewal to TRA."},
  {id:"d4",name:"ISM Safety Management Certificate",category:"Compliance",expiry:d(305),status:"Valid",uploadedDate:d(-60),size:"3.4 MB",type:"PDF",notes:""},
  {id:"d5",name:"EPIRB Registration",category:"Safety",expiry:d(88),status:"Expiring Soon",uploadedDate:d(-277),size:"0.8 MB",type:"PDF",notes:""},
  {id:"d6",name:"Life Raft Service Certificate",category:"Safety",expiry:d(155),status:"Valid",uploadedDate:d(-210),size:"1.5 MB",type:"PDF",notes:"Serviced by Viking Life-Saving."},
  {id:"d7",name:"Charter Licence",category:"Commercial",expiry:d(182),status:"Valid",uploadedDate:d(-183),size:"2.2 MB",type:"PDF",notes:""},
  {id:"d8",name:"Anti-Pollution Certificate (MARPOL)",category:"Compliance",expiry:d(-8),status:"Expired",uploadedDate:d(-373),size:"1.8 MB",type:"PDF",notes:"URGENT — renewal overdue."},
  {id:"d9",name:"Fire Suppression System Certificate",category:"Safety",expiry:d(270),status:"Valid",uploadedDate:d(-95),size:"1.1 MB",type:"PDF",notes:""},
  {id:"d10",name:"Crew Employment Contracts",category:"HR",expiry:null,status:"Valid",uploadedDate:d(-180),size:"5.6 MB",type:"PDF",notes:"All 5 crew contracts filed."},
];

const DOC_CATS=["Vessel","Compliance","Safety","Commercial","HR","Technical","Other"];


function DocRow({doc,canEdit,onEdit,selected,onSelect}) {
  const sc=docExpiryColor(doc.status);
  return <div style={{background:selected?C.navyMid:C.card,border:`1px solid ${selected?C.brass:doc.status==="Expired"?C.signal+"44":doc.status==="Expiring Soon"?C.amber+"44":C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:8,padding:"12px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:12,transition:"background .15s"}}>
    {canEdit&&<input type="checkbox" checked={selected||false} onChange={()=>onSelect&&onSelect(doc.id)} onClick={e=>e.stopPropagation()} style={{cursor:"pointer",flexShrink:0}}/>}
    <div style={{width:32,height:32,borderRadius:8,background:C.navyLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Ico i={doc.type==="Image"?Image:FileText} s={16} c={C.muted}/>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:600,color:C.text,fontSize:13}}>{doc.name}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>
        <span style={{color:C.muted}}>{doc.category}</span>
        {doc.uploadedDate&&<span> · Uploaded: {doc.uploadedDate}</span>}
        {doc.size&&doc.size!=="—"&&<span> · {doc.size}</span>}
      </div>
      {doc.notes&&<div style={{fontSize:11,color:C.muted,marginTop:2,fontStyle:"italic"}}>{doc.notes}</div>}
    </div>
    <div style={{textAlign:"right",flexShrink:0,marginRight:canEdit?4:0}}>
      {doc.expiry
        ?<><div style={{fontSize:10,color:C.muted}}>Expires</div>
          <div style={{fontSize:12,fontWeight:700,color:sc}}>{doc.expiry}</div>
          <div style={{fontSize:10,color:sc,marginBottom:3}}>{daysUntil(doc.expiry)}</div></>
        :<div style={{fontSize:11,color:C.muted,marginBottom:3}}>No expiry</div>}
      <Pill label={doc.status} bg={sc+"22"} color={sc} small dot/>
    </div>
    {canEdit&&<button onClick={()=>onEdit(doc)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:"0 4px",flexShrink:0}}>Edit</button>}
  </div>;
}

function DocumentsModule({docs,setDocs,role,initFilter,logAudit}) {
  const logD=(action,detail)=>logAudit&&logAudit(action,detail,"Documents");
  const [search,setSearch]=useState("");
  const [catFilter,setCatFilter]=useState("All");
  const [statusFilter,setStatusFilter]=useState(initFilter==="expiring"?"Alerts":"All");
  const [sortBy,setSortBy]=useState("expiry");
  const [showForm,setShowForm]=useState(false);
  const [editDoc,setEditDoc]=useState(null);
  const [form,setForm]=useState({name:"",category:"Vessel",expiry:"",type:"PDF",notes:"",size:"—"});
  const [bulkDocs,setBulkDocs]=useState([]);
  const canEdit=can(role,"canManageDocs");

  function bulkDocsAct(action){
    if(action==="delete"){
      setDocs(p=>p.filter(d=>!bulkDocs.includes(d.id)));
      logD&&logD("Document Deleted",`${bulkDocs.length} documents bulk-deleted`);
    }
    if(action==="markValid"){
      setDocs(p=>p.map(d=>bulkDocs.includes(d.id)?{...d,status:"Valid"}:d));
      logD&&logD("Document Updated",`${bulkDocs.length} documents marked Valid`);
    }
    setBulkDocs([]);
  }

  const expired=docs.filter(d=>d.status==="Expired");
  const expiring=docs.filter(d=>d.status==="Expiring Soon");

  const visible=docs.filter(d=>{
    if(catFilter!=="All"&&d.category!==catFilter) return false;
    if(statusFilter==="Alerts"&&!["Expired","Expiring Soon"].includes(d.status)) return false;
    if(statusFilter==="Valid"&&d.status!=="Valid") return false;
    if(statusFilter==="Expired"&&d.status!=="Expired") return false;
    if(search&&!d.name.toLowerCase().includes(search.toLowerCase())&&!d.notes?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="expiry"){
      if(!a.expiry&&!b.expiry) return 0;
      if(!a.expiry) return 1;
      if(!b.expiry) return -1;
      return a.expiry.localeCompare(b.expiry);
    }
    if(sortBy==="name") return a.name.localeCompare(b.name);
    if(sortBy==="category") return a.category.localeCompare(b.category);
    return 0;
  });

  function openForm(doc) {
    setEditDoc(doc||null);
    setForm(doc?{...doc}:{name:"",category:"Vessel",expiry:"",type:"PDF",notes:"",size:"—"});
    setShowForm(true);
  }

  function openAlteration(req) {
    setAlterationOf(req.id);
    setEditReq(null);
    setForm({ type:req.type, start:req.start, end:req.end, notes:"" });
    setShowForm(true);
  }

  function save() {
    if(!form.name) return;
    const status=docExpiryStatus(form.expiry);
    if(editDoc){
      setDocs(p=>p.map(d=>d.id===editDoc.id?{...d,...form,status}:d));
      logD("Document Updated",`${form.name} — updated (exp: ${form.expiry||"none"})`);
    } else {
      setDocs(p=>[...p,{...form,id:`d${Date.now()}`,status,uploadedDate:TODAY}]);
      logD("Document Added",`${form.name} — ${form.category} document added`);
    }
    setShowForm(false);
  }

  function del(id,name){
    setDocs(p=>p.filter(d=>d.id!==id)); setShowForm(false);
    logD("Document Deleted",`${name} — deleted from vault`);
  }

  const hasFilters=search||catFilter!=="All"||statusFilter!=="All";

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {canEdit&&<input type="checkbox" title="Select all visible"
          checked={bulkDocs.length===visible.length&&visible.length>0}
          onChange={()=>setBulkDocs(bulkDocs.length===visible.length?[]:visible.map(d=>d.id))}
          style={{cursor:"pointer",width:16,height:16}}/>}
        <div>
          <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Document Vault <span style={{color:C.muted,fontSize:14,fontWeight:400}}>({visible.length}/{docs.length})</span></div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{expired.length} expired · {expiring.length} expiring soon{bulkDocs.length>0&&` · ${bulkDocs.length} selected`}</div>
        </div>
      </div>
      {canEdit&&<button onClick={()=>openForm(null)} style={{...btn,background:C.brass,color:C.bg}}>+ Add Document</button>}
    </div>

    {/* Doc bulk bar */}
    {bulkDocs.length>0&&canEdit&&<div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.brass,fontWeight:700}}>{bulkDocs.length} documents selected</div>
      <div style={{width:1,height:20,background:C.border}}/>
      <button onClick={()=>bulkDocsAct("markValid")} style={{...btn,background:C.green+"22",color:C.greenL,padding:"5px 12px",fontSize:11,border:`1px solid ${C.green}44`}}>Mark Valid</button>
      <button onClick={()=>bulkDocsAct("delete")} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 12px",fontSize:11,border:`1px solid ${C.signal}44`}}>Delete Selected</button>
      <button onClick={()=>setBulkDocs([])} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 12px",fontSize:11}}>✕ Clear</button>
    </div>}

    {/* Alert summary — clickable */}
    {(expired.length>0||expiring.length>0)&&<div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
      {expired.length>0&&<div onClick={()=>setStatusFilter("Expired")} style={{background:`${C.signal}12`,border:`1px solid ${C.signal}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:180,cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.background=C.signal+"20"} onMouseLeave={e=>e.currentTarget.style.background=C.signal+"12"}>
        <div style={{fontWeight:700,color:C.signal,fontSize:12,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><Ico i={AlertCircle} s={12} c={C.signal}/>{"Expired ("}{expired.length})</div>
        {expired.map(d=><div key={d.id} style={{fontSize:11,color:C.muted,marginBottom:1}}>{d.name}</div>)}
        <div style={{fontSize:10,color:C.signal,marginTop:4}}>Tap to filter -></div>
      </div>}
      {expiring.length>0&&<div onClick={()=>setStatusFilter("Alerts")} style={{background:`${C.amber}12`,border:`1px solid ${C.amber}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:180,cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.background=C.amber+"20"} onMouseLeave={e=>e.currentTarget.style.background=C.amber+"12"}>
        <div style={{fontWeight:700,color:C.amber,fontSize:12,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><Ico i={AlertTriangle} s={12} c={C.amber}/>{"Expiring Soon ("}{expiring.length})</div>
        {expiring.map(d=><div key={d.id} style={{fontSize:11,color:C.muted,marginBottom:1}}>{d.name} — {daysUntil(d.expiry)}</div>)}
        <div style={{fontSize:10,color:C.amber,marginTop:4}}>Tap to filter -></div>
      </div>}
    </div>}

    {/* Filter bar */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"
        style={{...inp,width:200,padding:"6px 10px",fontSize:12}}/>
      <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        <option value="All">All Categories</option>
        {DOC_CATS.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      {["All","Alerts","Valid","Expired"].map(f=><button key={f} onClick={()=>setStatusFilter(f)}
        style={{...btn,background:statusFilter===f?(f==="Alerts"||f==="Expired"?C.signal:C.brass):C.navyLight,color:statusFilter===f?C.bg:C.muted,border:`1px solid ${statusFilter===f?(f==="Alerts"||f==="Expired"?C.signal:C.brass):C.border}`,padding:"5px 11px",fontSize:11}}>{f}</button>)}
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none",borderColor:C.brass+"55"}}>
        {[["expiry","Sort: Expiry"],["name","Sort: Name"],["category","Sort: Category"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
      {hasFilters&&<button onClick={()=>{setSearch("");setCatFilter("All");setStatusFilter("All");}}
        style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear</button>}
    </div>

    {/* Doc list — flat when filtered/sorted, grouped by category when browsing all */}
    {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={FileText} s={28} c={C.muted}/></div>No documents match.</div>}

    {visible.length>0&&(catFilter!=="All"||statusFilter!=="All"||sortBy!=="expiry"||search
      ? <div>
          <div style={{fontSize:10,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>{visible.length} document{visible.length!==1?"s":""} — sorted by {sortBy==="expiry"?"expiry date":sortBy==="name"?"name":"category"}</div>
          {visible.map(doc=><DocRow key={doc.id} doc={doc} canEdit={canEdit} onEdit={openForm} selected={bulkDocs.includes(doc.id)} onSelect={id=>setBulkDocs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])}/>)}
        </div>
      : DOC_CATS.map(cat=>{
          const cd=visible.filter(d=>d.category===cat);
          if(!cd.length) return null;
          return <div key={cat} style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,paddingBottom:5,borderBottom:`1px solid ${C.border}`}}>{cat} ({cd.length})</div>
            {cd.map(doc=><DocRow key={doc.id} doc={doc} canEdit={canEdit} onEdit={openForm} selected={bulkDocs.includes(doc.id)} onSelect={id=>setBulkDocs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])}/>)}
          </div>;
        })
    )}

    {showForm&&<Modal title={editDoc?"Edit Document":"Add Document"} onClose={()=>setShowForm(false)} width={460}>
      <FF label="Document Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} req ph="e.g. Hull & P&I Insurance"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <FF label="Category" type="select" value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} half opts={DOC_CATS}/>
        <FF label="File Type" type="select" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} half opts={["PDF","Image","Word","Other"]}/>
        <FF label="Expiry Date" type="date" value={form.expiry} onChange={v=>setForm(p=>({...p,expiry:v}))} half/>
      </div>
      <FF label="Notes" type="textarea" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} rows={2} ph="Renewal notes, reminders…"/>
      <div style={{display:"flex",gap:10}}>
        <button onClick={save} style={{...btn,background:C.brass,color:C.bg}}>Save Document</button>
        <button onClick={()=>setShowForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
        {editDoc&&<button onClick={()=>del(editDoc.id,editDoc.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
      </div>
    </Modal>}
    {["captain","management"].includes(role)&&<FloatingAI label="Document Q&A" icon="file" color={C.greenL}><AIDocQAModule docs={docs} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════

const NAV=[
  {id:"dashboard",   label:"Dashboard",   icon:"dashboard"},
  {id:"tasks",       label:"Tasks",       icon:"tasks"},
  {id:"maintenance", label:"Maintenance", icon:"maintenance"},
  {id:"inventory",   label:"Inventory",   icon:"inventory"},
  {id:"logbook",     label:"Logbook",     icon:"logbook"},
  {id:"calendar",    label:"Calendar",    icon:"calendar"},
  {id:"weather",     label:"Weather",     icon:"weather"},
  {id:"crew",        label:"Crew",        icon:"crew"},
  {id:"leave",       label:"Leave",       icon:"leave"},
  {id:"documents",   label:"Documents",   icon:"documents"},
  {id:"drive",       label:"Drive Sync",  icon:"drive"},
  {id:"ai",          label:"AI Assistant",icon:"ai"},
  {id:"hours",       label:"Hours",       icon:"hours"},
  {id:"audit",       label:"Audit Log",   icon:"audit"},
];

// Lucide icon map for nav
const NAV_ICON_MAP = {
  dashboard:LayoutDashboard, tasks:Clipboard, maintenance:Wrench,
  inventory:Package, logbook:BookOpen, calendar:Calendar,
  weather:Cloud, crew:Users, leave:Umbrella, documents:FileText,
  drive:Globe, ai:Bot, hours:Clock, audit:Search,
};
function NavIcon({id, size=18, color, strokeWidth=1.8}) {
  const I = NAV_ICON_MAP[id]||LayoutDashboard;
  return <I size={size} color={color} strokeWidth={strokeWidth}/>;
}

function navVisible(id,role) { return hasNav(role,id); }


// ═══════════════════════════════════════════════════════════════
// CALENDAR MODULE — Yacht Availability Management
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CALENDAR & VESSEL REGISTRY — AI-search-ready data structures
// ═══════════════════════════════════════════════════════════════

const AVAIL_TYPES = {
  // ── Internal operational types ─────────────────────────────
  Available:    { color:"#25b085", bg:"#25b08522", border:"#25b08555", icon:"✅", IconC:CheckCircle,   label:"Available",        external:"Available"     },
  Booked:       { color:"#c9a84c", bg:"#c9a84c22", border:"#c9a84c55", icon:"⛵", IconC:Ship,          label:"Booked",           external:"Unavailable"   },
  "Owner Usage":{ color:"#6b8cba", bg:"#6b8cba22", border:"#6b8cba55", icon:"👑", IconC:Crown,         label:"Owner Usage",      external:"Unavailable"   },
  "Maintenance Block":{ color:"#e07b39", bg:"#e07b3922", border:"#e07b3955", icon:"⚙️", IconC:Wrench,  label:"Maintenance Block", external:"Unavailable" },
  "Crew Change":{ color:"#9b59b6", bg:"#9b59b622", border:"#9b59b655", icon:"👥", IconC:Users,         label:"Crew Change",      external:"Unavailable"   },
  // ── Crew Leave — auto-generated from approved leave requests ─
  // Internal only: captain/management see who is on leave
  // External: shown as Unavailable — no crew data leaked to agents
  "Crew Leave": { color:"#3b9fd4", bg:"#3b9fd422", border:"#3b9fd455", icon:"🏖️", IconC:Umbrella,    label:"Crew Leave",       external:"Unavailable"   },
  Unavailable:  { color:"#cf4338", bg:"#cf433822", border:"#cf433855", icon:"🚫", IconC:Ban,           label:"Unavailable",      external:"Unavailable"   },
  Hold:         { color:"#e0a030", bg:"#e0a03022", border:"#e0a03055", icon:"⏳", IconC:Clock,         label:"Hold",             external:"Enquire Only"  },
  "Enquire Only":{ color:"#d97b2a", bg:"#d97b2a22", border:"#d97b2a55", icon:"💬", IconC:MessageSquare, label:"Enquire Only",   external:"Enquire Only"  },
};

// ── CALENDAR ENTRY SCHEMA ─────────────────────────────────────
// Each entry is enriched with queryable fields for AI search.
// Fields marked [AI] are specifically indexed for availability queries.
//
// {
//   id:            string       — unique entry id
//   type:          string       — AVAIL_TYPES key
//   title:         string       — human label
//   start:         "YYYY-MM-DD" — [AI] range start
//   end:           "YYYY-MM-DD" — [AI] range end
//   startTime:     "HH:MM"
//   endTime:       "HH:MM"
//   notes:         string       — internal (never exposed to agents)
//   createdBy:     string       — role that created the entry
//   // Availability-specific fields (only relevant when type === "Available")
//   guestCapacity: number|null  — [AI] max guests for this window (inherits from vessel profile if null)
//   charterTypes:  string[]     — [AI] e.g. ["Day Charter","Overnight Charter"]
//   minNights:     number|null  — minimum charter duration
//   maxNights:     number|null  — maximum charter duration
//   priceOverride: {daily:number,currency:string}|null — entry-level rate override
// }

// ── CHARTER DETAILS SCHEMA ───────────────────────────────────
// charterDetails is attached to any Booked calendar entry.
// Fields are role-filtered when displayed to crew.
// Department visibility: captain=all, engineer=engineering, stew=guest+interior,
//                        chef=galley+dietary, deckhand=deck+arrival/departure

// ── Leave type/status constants (used by CalendarModule + LeaveModule) ──
const LEAVE_TYPES = [
  { id:"annual",    label:"Annual Leave",      icon:"🏖️",  IconC:Umbrella,      color:"#25b085" },
  { id:"timeoff",   label:"Time Off",          icon:"⏸️",  IconC:Clock,         color:"#8b7cf6" },
  { id:"rotation",  label:"Rotation Request",  icon:"🔄",  IconC:RefreshCw,     color:"#3b82f6" },
  { id:"sick",      label:"Sick Leave",        icon:"🏥",  IconC:Heart,         color:"#cf4338" },
  { id:"emergency", label:"Emergency Leave",   icon:"🚨",  IconC:AlertTriangle, color:"#d97b2a" },
];

function LeaveTypeIcon({type, size=18, color}) {
  const lt = LEAVE_TYPES.find(t=>t.id===type);
  const IC = lt?.IconC || Calendar;
  const col = color || lt?.color || C.muted;
  return <IC size={size} color={col} strokeWidth={1.8}/>;
}

const LEAVE_STATUS = {
  pending:  { label:"Pending",  color:"#d97b2a", bg:"#d97b2a18" },
  approved: { label:"Approved", color:"#25b085", bg:"#25b08518" },
  declined: { label:"Declined", color:"#cf4338", bg:"#cf433818" },
  cancelled:{ label:"Cancelled",color:"#7a8fab", bg:"#7a8fab18" },
};

const EMPTY_CHARTER_DETAILS = {
  // General
  charterType:       "",
  guestCount:        "",
  guestNotes:        "",
  occasion:          "",
  // Arrival
  arrivalFrom:       "",
  arrivalTime:       "",
  arrivalLocation:   "",
  arrivalNotes:      "",
  // Departure
  departureTime:     "",
  departureLocation: "",
  departureNotes:    "",
  // Guest requirements (Stew + Captain)
  vipGuests:         "",
  specialRequests:   "",
  cabinAssignments:  "",
  cabinPreferences:  "",          // temperature, pillow type, turn-down prefs
  // Dietary — Chef + Captain
  dietaryReqs:       "",
  allergies:         "",
  mealPreferences:   "",          // cuisine style
  mealRequests:      "",          // specific meal requests / menu notes
  guestFoodPrefs:    "",          // per-guest food preferences
  // Drinks — Stew + Captain
  drinkPreferences:  "",
  winePreferences:   "",          // specific wines / champagne
  softDrinkPrefs:    "",          // juices, sodas, water brands
  // Deck / Watersports
  watersportsReqs:   "",          // general watersports note
  jetSkiReqs:        "",          // jet ski requests
  seabobReqs:        "",          // seabob requests
  efoilReqs:         "",          // e-foil requests
  tenderOps:         "",          // tender usage
  beachSetupReqs:    "",          // beach club / picnic / floating mat setup
  // Engineering
  fuelRequired:      "",
  engineNotes:       "",
  powerReqs:         "",          // shore power, generator schedule
  equipmentReqs:     "",          // special equipment / technical requests
  // Internal (Captain only)
  internalNotes:     "",
  agentName:         "",
  agentContact:      "",
  // Documents & AI extraction
  uploadedDocs:      [],  // [{id, name, type, size, dataUrl, uploadedAt, aiExtracted, published}]
};

const INIT_CALENDAR = [
  {id:"cal1", type:"Booked", title:"Charter — Johnson Family",
    start:"2026-07-05", end:"2026-07-12", startTime:"08:00", endTime:"18:00",
    notes:"4 guests. Pick up Dubai Marina.", createdBy:"captain",
    guestCapacity:4, charterTypes:["Overnight Charter"], minNights:7, maxNights:7, priceOverride:null,
    charterDetails:{
      charterType:      "Overnight Charter",
      guestCount:       4,
      guestNotes:       "Family of 4. Parents + 2 teenage children (15 and 17). Very relaxed, first charter.",
      occasion:         "Family holiday",
      arrivalFrom:      "London, UK",
      arrivalTime:      "10:00",
      arrivalLocation:  "Dubai Marina — Gate 4, Berth 14",
      arrivalNotes:     "Transfer from Atlantis The Palm. Guest contact: Mark Johnson +44 7700 900123.",
      departureTime:    "16:00",
      departureLocation:"Dubai Marina — Gate 4",
      departureNotes:   "Return transfer to JW Marriott Marina arranged.",
      vipGuests:        "",
      specialRequests:  "Snorkelling trip on Day 3. Sunset dinner on deck Night 2.",
      cabinAssignments: "Master: Mr & Mrs Johnson. Port cabin: teenagers.",
      dietaryReqs:      "Mrs Johnson — vegetarian. Children prefer simple food.",
      allergies:        "None declared.",
      mealPreferences:  "Mediterranean cuisine preferred. Light lunches.",
      mealRequests:     "Sunset dinner on deck Night 2. BBQ lunch Day 3.",
      guestFoodPrefs:   "Mrs Johnson: no meat. Kids: pasta, pizza, burgers. Mr Johnson: no restrictions.",
      drinkPreferences: "White wine preferred. No spirits. Soft drinks for children.",
      winePreferences:  "Sauvignon Blanc or Pinot Grigio. Prosecco for welcome drink.",
      softDrinkPrefs:   "Sparkling water (Perrier), Coca-Cola, fresh lemonade for kids.",
      cabinAssignments: "Master: Mr & Mrs Johnson. Port cabin: teenagers.",
      cabinPreferences: "Master: cool A/C (21°C). Soft pillows. Teen cabin: blackout blinds.",
      watersportsReqs:  "Paddleboards daily. Jet ski Day 2 afternoon.",
      jetSkiReqs:       "1× jet ski Day 2 PM — both parents want to ride. Teenagers may join with supervision.",
      seabobReqs:       "Seabob requested Day 3 snorkelling trip.",
      efoilReqs:        "",
      tenderOps:        "Tender to beach Day 4. Morning coffee run to marina Day 1.",
      beachSetupReqs:   "Beach picnic Day 4 — umbrella, loungers, cool box with drinks and snacks.",
      fuelRequired:     "Approx 600L. Full tank before departure.",
      engineNotes:      "Standard passage. No overnight runs.",
      powerReqs:        "No special power requirements. Shore power until 09:00 departure.",
      equipmentReqs:    "Snorkelling gear for 4 required. Life jackets for teenagers.",
      internalNotes:    "Commission 10% — invoice to be raised after departure. Balance due 7 days post-charter.",
      agentName:        "Blue Water Charter Co.",
      agentContact:     "reservations@bluewatercharters.com · +971 50 123 4567",
    }},
  {id:"cal2", type:"Owner Usage", title:"Owner Week",
    start:"2026-07-18", end:"2026-07-25", startTime:"10:00", endTime:"18:00",
    notes:"Owner + 2 guests. Full crew required.",
    createdBy:"captain", guestCapacity:null, charterTypes:[], minNights:null, maxNights:null, priceOverride:null, charterDetails:null},
  {id:"cal3", type:"Maintenance Block", title:"Annual Haul-Out",
    start:"2026-08-01", end:"2026-08-14", startTime:"08:00", endTime:"17:00",
    notes:"Drydock at Grandweld.",
    createdBy:"captain", guestCapacity:null, charterTypes:[], minNights:null, maxNights:null, priceOverride:null, charterDetails:null},
  {id:"cal4", type:"Available", title:"Available for Charter",
    start:"2026-07-13", end:"2026-07-17", startTime:"00:00", endTime:"23:59", notes:"",
    createdBy:"captain", guestCapacity:12, charterTypes:["Day Charter","Overnight Charter"], minNights:1, maxNights:5, priceOverride:null, charterDetails:null},
  {id:"cal5", type:"Crew Change", title:"Crew Rotation",
    start:"2026-07-26", end:"2026-07-28", startTime:"09:00", endTime:"17:00",
    notes:"Chief Stew and Deckhand changeover.",
    createdBy:"captain", guestCapacity:null, charterTypes:[], minNights:null, maxNights:null, priceOverride:null, charterDetails:null},
  {id:"cal6", type:"Unavailable", title:"Port Authority Inspection",
    start:"2026-07-29", end:"2026-07-30", startTime:"08:00", endTime:"13:00",
    notes:"DMCA inspection.",
    createdBy:"captain", guestCapacity:null, charterTypes:[], minNights:null, maxNights:null, priceOverride:null, charterDetails:null},
  {id:"cal7", type:"Booked", title:"Charter — Al Maktoum Group",
    start:"2026-08-20", end:"2026-08-27", startTime:"09:00", endTime:"20:00",
    notes:"VIP booking. 6 guests.", createdBy:"captain",
    guestCapacity:6, charterTypes:["Weekly Charter"], minNights:7, maxNights:7, priceOverride:null,
    charterDetails:{
      charterType:      "Weekly Charter",
      guestCount:       6,
      guestNotes:       "Corporate group. High-end guests. Expect full service at all times.",
      occasion:         "Corporate retreat",
      arrivalFrom:      "Dubai",
      arrivalTime:      "09:00",
      arrivalLocation:  "Dubai Marina — Pier 7",
      arrivalNotes:     "Guests arriving by private car. Crew to be in full uniform on deck.",
      departureTime:    "20:00",
      departureLocation:"Dubai Marina — Pier 7",
      departureNotes:   "Formal handshake and farewell expected from Captain.",
      vipGuests:        "Sheikh Abdullah Al Maktoum — lead guest. Requires highest level of protocol.",
      specialRequests:  "Fishing on Day 2. Formal dinner every evening. Sunrise breakfast Day 5.",
      cabinAssignments: "Master: Sheikh Abdullah. VIP: Associate 1 & 2. Remaining: double cabins.",
      dietaryReqs:      "Halal food only. No pork on board during entire charter.",
      allergies:        "None declared but confirm before provisioning.",
      mealPreferences:  "Arabic and Lebanese cuisine preferred. International options available.",
      mealRequests:     "Formal dinner every evening. Sunrise breakfast Day 5. Fishing BBQ Day 2.",
      guestFoodPrefs:   "Sheikh Abdullah: traditional Arabic dishes. Others: mixed preferences, confirm with PA.",
      drinkPreferences: "No alcohol on board. Premium soft drinks and fresh juices only.",
      winePreferences:  "N/A — no alcohol.",
      softDrinkPrefs:   "Voss still water, fresh-squeezed juices, Arabic coffee and dates at all times.",
      cabinAssignments: "Master: Sheikh Abdullah. VIP: Associate 1 & 2. Remaining: double cabins.",
      cabinPreferences: "Master: warm A/C (24°C), specific prayer mat direction setup. All cabins: daily fresh flowers.",
      watersportsReqs:  "Fishing Day 2. Jet ski optional Day 4.",
      jetSkiReqs:       "2× jet skis available Day 4 if requested by guests.",
      seabobReqs:       "",
      efoilReqs:        "",
      tenderOps:        "Tender on standby daily. Night anchorage Days 3 & 4.",
      beachSetupReqs:   "Floating platform + sunbeds for anchorage Days 3 & 4. Formal table setup for sunset dinner.",
      fuelRequired:     "Full tank + 400L reserve. Plan for overnight anchoring.",
      engineNotes:      "Night anchoring Days 3-4. Generator to run on silent mode after 22:00.",
      powerReqs:        "Generator silent mode after 22:00. Shore power Day 1 only. Full power for A/C all week.",
      equipmentReqs:    "Full fishing kit required Day 2. Satellite phone must be operational. PA system for evening events.",
      internalNotes:    "Direct booking. No agent. Handled personally by Captain.",
      agentName:        "Direct booking",
      agentContact:     "",
    }},
  {id:"cal8", type:"Available", title:"Available for Charter",
    start:"2026-08-28", end:"2026-09-15", startTime:"00:00", endTime:"23:59", notes:"",
    createdBy:"captain", guestCapacity:12, charterTypes:["Day Charter","Overnight Charter","Weekend Charter","Weekly Charter"], minNights:1, maxNights:19, priceOverride:null, charterDetails:null},
];

// ── CALENDAR RULES DEFAULTS ───────────────────────────────────
const DEFAULT_CAL_RULES = {
  minNoticeHours:    48,
  turnaroundHours:   24,
  maintBufferDays:   1,
  blackouts:         [],   // [{id, start, end, label}]
  ownerPriority:     [],   // [{id, start, end, label}]
};

// ── YACHT PROFILE SCHEMA ──────────────────────────────────────
// Fields marked [AI] are indexed for availability search queries.
// This is the vessel "listing" record — one per registered yacht.
//
// Future agent search queries map directly to these fields:
//   "Available yachts in Dubai"          → operatingRegion includes "Dubai"
//   "Yachts for 10 guests"               → guestCapacity >= 10
//   "Luxury yachts in Med this week"     → operatingRegion includes "Mediterranean"
//                                          + calEntries has Available window covering dates
//   "Overnight charters available"       → calEntries[].charterTypes includes "Overnight Charter"

const DEFAULT_YACHT_PROFILE = {
  // ── Identity ──────────────────────────────────────────────
  yachtName:         "",
  yachtType:         "Charter",    // [AI] "Private" | "Charter" | "Mixed Use"
  vesselClass:       "Motor Yacht",
  lengthM:           "",
  // ── Official Documentation ────────────────────────────────
  imoNumber:         "",           // IMO vessel number
  flagState:         "",           // Flag state / country of registration
  portOfRegistry:    "",           // Port of registry
  callSign:          "",           // Radio call sign
  mmsi:              "",           // Maritime Mobile Service Identity
  grossTonnage:      "",           // GT
  officialNumber:    "",           // Official vessel number (flag state)
  // ── Capacity ─────────────────────────────────────────────
  guestCapacity:     "",           // [AI]
  overnightCapacity: "",           // [AI]
  // ── Location ─────────────────────────────────────────────
  homeMarina:        "",
  operatingRegion:   "Dubai, UAE", // [AI]
  additionalRegions: [],           // [AI]
  // ── Charter config ───────────────────────────────────────
  charterTypes:      ["Day Charter","Overnight Charter"],
  minCharterNights:  1,
  minNoticeDays:     2,
  amenities:         [],
  // ── Captain-controlled registry visibility ───────────────
  isActive:          true,
  isCharterEnabled:  true,
  agentVisible:      true,
  showPricingToAgent:false,
  // ── Rates (internal — charter only) ──────────────────────
  hourlyRate:        "",
  dailyRate:         "",
  currency:          "AED",
  // ── Metadata ─────────────────────────────────────────────
  vesselId:          "",
  registeredAt:      "",
  updatedAt:         "",
};

const OPERATING_REGIONS = [
  "Dubai, UAE","Abu Dhabi, UAE","UAE — Full Gulf",
  "Mediterranean — East","Mediterranean — West","Mediterranean — Full",
  "Caribbean","Red Sea","Indian Ocean","Maldives","Southeast Asia","Global",
];

const VESSEL_CLASSES = ["Motor Yacht","Sailing Yacht","Catamaran","Superyacht","RIB","Gulet","Other"];

const CHARTER_TYPE_OPTIONS = [
  "Day Charter","Overnight Charter","Weekend Charter",
  "Weekly Charter","Corporate Event","Private Party","Other",
];

const AMENITY_OPTIONS = [
  "Jacuzzi","Jet Ski","Paddleboards","Snorkelling Gear","Diving Equipment",
  "Fishing Equipment","Kayaks","Water Slide","Flyboard","Seabob",
  "Beach Club Platform","Tender","Helicopter Pad","Cinema Room",
  "Gym","Spa","Piano","BBQ","Stabilisers",
];

// ── VESSEL REGISTRY SCHEMA ────────────────────────────────────
// The registry is an array of VesselRecord objects.
// One record per yacht registered in the system.
// Agents query across ALL records in the registry.
//
// VesselRecord: {
//   id:         string         — globally unique vessel id
//   profile:    YachtProfile   — the vessel listing data
//   calEntries: CalEntry[]     — this vessel's calendar
//   rules:      CalRules       — this vessel's availability rules
//   enquiries:  Enquiry[]      — enquiries made against this vessel
//   agentAccess: string[]      — agent ids/emails permitted to see this vessel
//   createdAt:  string         — ISO timestamp
//   updatedAt:  string         — ISO timestamp
// }

function makeVesselId() {
  return `vsl_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

// ── INITIAL VESSEL (M/Y Tiberius — the active boat in Bridge) ─
const INIT_VESSEL_RECORD = {
  id:          "vsl_tiberius",
  profile:     {
    ...DEFAULT_YACHT_PROFILE,
    yachtName:          "M/Y Tiberius",
    yachtType:          "Mixed Use",
    vesselClass:        "Motor Yacht",
    lengthM:            28,
    imoNumber:          "",
    flagState:          "",
    portOfRegistry:     "",
    callSign:           "",
    mmsi:               "",
    grossTonnage:       "",
    officialNumber:     "",
    guestCapacity:      12,
    overnightCapacity:  6,
    homeMarina:         "Dubai Marina",
    operatingRegion:    "Dubai, UAE",
    additionalRegions:  ["Abu Dhabi, UAE","UAE — Full Gulf"],
    charterTypes:       ["Day Charter","Overnight Charter","Weekend Charter"],
    minCharterNights:   1,
    minNoticeDays:      2,
    amenities:          ["Jet Ski","Paddleboards","Snorkelling Gear","Tender","Stabilisers","BBQ"],
    vesselId:           "vsl_tiberius",
    registeredAt:       "2026-01-01T00:00:00.000Z",
    updatedAt:          "2026-01-01T00:00:00.000Z",
    isActive:           true,
    isCharterEnabled:   true,
    agentVisible:       true,
    showPricingToAgent: false,
    currency:           "AED",
    dailyRate:          "18000",
    hourlyRate:         "",
  },
  calEntries:  INIT_CALENDAR,
  rules:       DEFAULT_CAL_RULES,
  enquiries:   [],
  agentAccess: ["all"],   // "all" = any agent can see; or array of agent ids
  createdAt:   "2026-01-01T00:00:00.000Z",
  updatedAt:   new Date().toISOString(),
};

// ── AVAILABILITY QUERY ENGINE ─────────────────────────────────
// PRIVACY REQUIREMENT: When called for external/agent queries,
// this function MUST receive the privacy-filtered registry
// (applyRegistryPrivacyLayer output), never the raw registry.
// The AI layer must always pass queryableRegistry, not vesselRegistry.
// This is enforced in CalendarModule via the queryableRegistry binding.
function queryAvailability(vesselRegistry, criteria={}) {
  const results = [];

  for(const vessel of vesselRegistry) {
    if(!vessel.profile.isActive) continue;

    const score = { total:0, reasons:[], violations:[] };

    // 1. REGION MATCH
    if(criteria.region) {
      const regionLower = criteria.region.toLowerCase();
      const allRegions  = [vessel.profile.operatingRegion, ...(vessel.profile.additionalRegions||[])];
      const regionMatch = allRegions.some(r=>r.toLowerCase().includes(regionLower));
      if(!regionMatch) continue; // hard filter
      score.total += 30;
      score.reasons.push(`Operates in ${vessel.profile.operatingRegion}`);
    }

    // 2. GUEST CAPACITY
    if(criteria.guests) {
      const cap = Number(vessel.profile.guestCapacity);
      if(cap && cap < Number(criteria.guests)) continue; // hard filter
      if(cap) { score.total += 20; score.reasons.push(`Capacity: ${cap} guests`); }
    }

    // 3. DATE AVAILABILITY — check calEntries for Available windows covering the range
    let availableWindows = [];
    if(criteria.startDate) {
      const s = criteria.startDate;
      const e = criteria.endDate || s;
      availableWindows = vessel.calEntries.filter(entry=>{
        if(entry.type !== "Available") return false;
        // Window must cover the entire requested range
        return entry.start <= s && entry.end >= e;
      });

      // Also apply rules — check if dates are blocked by rules
      const ruleViolations = [];
      const rules = vessel.rules;
      let d = new Date(s+"T00:00:00");
      const endDt = new Date(e+"T23:59:00");
      while(d <= endDt) {
        const ds = d.toISOString().split("T")[0];
        const ev = evaluateDate(ds, vessel.calEntries, rules);
        if(ev.restricted) {
          ev.reasons.forEach(r=>{
            if(r.severity==="block" && !ruleViolations.find(v=>v===r.label))
              ruleViolations.push(r.label);
          });
        }
        d.setDate(d.getDate()+1);
      }
      score.violations = ruleViolations;

      if(availableWindows.length === 0) continue; // hard filter — no availability
      score.total += 25;
      score.reasons.push(`${availableWindows.length} available window${availableWindows.length>1?"s":""} covering requested dates`);
    }

    // 4. YACHT TYPE
    if(criteria.yachtType) {
      if(vessel.profile.yachtType === criteria.yachtType) {
        score.total += 10;
        score.reasons.push(`Type: ${vessel.profile.yachtType}`);
      }
    }

    // 5. VESSEL CLASS
    if(criteria.vesselClass) {
      if(vessel.profile.vesselClass?.toLowerCase().includes(criteria.vesselClass.toLowerCase())) {
        score.total += 10;
        score.reasons.push(`${vessel.profile.vesselClass}`);
      }
    }

    // 6. CHARTER TYPE
    if(criteria.charterType) {
      const supported = [
        ...(vessel.profile.charterTypes||[]),
        ...availableWindows.flatMap(w=>w.charterTypes||[]),
      ];
      if(supported.includes(criteria.charterType)) {
        score.total += 10;
        score.reasons.push(`Supports ${criteria.charterType}`);
      }
    }

    // 7. LENGTH
    if(criteria.minLengthM) {
      const len = Number(vessel.profile.lengthM);
      if(len && len >= Number(criteria.minLengthM)) {
        score.total += 5;
        score.reasons.push(`${len}m length`);
      }
    }

    // 8. AMENITIES
    if(criteria.amenities?.length) {
      const has = (vessel.profile.amenities||[]);
      const matched = criteria.amenities.filter(a=>has.includes(a));
      if(matched.length===criteria.amenities.length) {
        score.total += 5;
        score.reasons.push(`Has: ${matched.join(", ")}`);
      }
    }

    results.push({
      vessel,
      availableWindows,
      matchScore:    score.total,
      matchReasons:  score.reasons,
      ruleViolations:score.violations,
    });
  }

  // Sort by score descending, violations last
  return results.sort((a,b)=>{
    if(a.ruleViolations.length !== b.ruleViolations.length)
      return a.ruleViolations.length - b.ruleViolations.length;
    return b.matchScore - a.matchScore;
  });
}

// ── AGENT MULTI-VESSEL REGISTRY ───────────────────────────────
// Agents can register and manage multiple vessel calendars.
// Each vessel the agent adds gets a VesselRecord in the shared registry.
// The active Bridge instance (M/Y Tiberius) is always INIT_VESSEL_RECORD.
// Future: registry will be server-side; for now stored in Bridge state.

const INIT_VESSEL_REGISTRY = [INIT_VESSEL_RECORD];

// ── RULES ENGINE ──────────────────────────────────────────────
// Returns an object describing what restrictions apply to a given date
function evaluateDate(dateStr, calEntries, rules) {
  const result = {
    restricted:      false,
    reasons:         [],       // array of {type, label, severity} — "info"|"warn"|"block"
    turnaroundBlock: false,
    blackout:        false,
    ownerPriority:   false,
    maintBuffer:     false,
    noticeBlock:     false,
  };

  const dt = new Date(dateStr + "T00:00:00");

  // 1. MINIMUM NOTICE — block dates too close to today
  if(rules.minNoticeHours > 0) {
    const hoursFromNow = (dt - new Date()) / (1000 * 60 * 60);
    if(hoursFromNow >= 0 && hoursFromNow < rules.minNoticeHours) {
      result.noticeBlock = true;
      result.restricted  = true;
      result.reasons.push({type:"notice", severity:"block",
        label:`Within ${rules.minNoticeHours}h notice window`});
    }
  }

  // 2. TURNAROUND — block N hours after a booking ends
  if(rules.turnaroundHours > 0) {
    const bookings = calEntries.filter(e=>e.type==="Booked");
    for(const b of bookings) {
      const endDt    = new Date(b.end + "T23:59:00");
      const hoursGap = (dt - endDt) / (1000 * 60 * 60);
      if(hoursGap > 0 && hoursGap < rules.turnaroundHours) {
        result.turnaroundBlock = true;
        result.restricted      = true;
        result.reasons.push({type:"turnaround", severity:"block",
          label:`${rules.turnaroundHours}h turnaround after "${b.title}"`});
        break;
      }
    }
  }

  // 3. MAINTENANCE BUFFER — block N days before/after maintenance entries
  if(rules.maintBufferDays > 0) {
    const maint = calEntries.filter(e=>e.type==="Maintenance Block");
    for(const m of maint) {
      const bufMs  = rules.maintBufferDays * 24 * 60 * 60 * 1000;
      const mStart = new Date(m.start + "T00:00:00");
      const mEnd   = new Date(m.end   + "T23:59:00");
      const beforeStart = (mStart - dt);
      const afterEnd    = (dt - mEnd);
      if((beforeStart > 0 && beforeStart <= bufMs) ||
         (afterEnd    > 0 && afterEnd    <= bufMs)) {
        result.maintBuffer = true;
        result.restricted  = true;
        result.reasons.push({type:"maint_buffer", severity:"warn",
          label:`Within ${rules.maintBufferDays}d maintenance buffer ("${m.title}")`});
        break;
      }
    }
  }

  // 4. BLACKOUT PERIODS — captain-defined hard blocks
  for(const b of (rules.blackouts||[])) {
    if(dateStr >= b.start && dateStr <= b.end) {
      result.blackout   = true;
      result.restricted = true;
      result.reasons.push({type:"blackout", severity:"block",
        label:`Blackout: ${b.label||"Captain blackout"}`});
      break;
    }
  }

  // 5. OWNER PRIORITY — soft advisory flag
  for(const o of (rules.ownerPriority||[])) {
    if(dateStr >= o.start && dateStr <= o.end) {
      result.ownerPriority = true;
      result.restricted    = true;
      result.reasons.push({type:"owner_priority", severity:"info",
        label:`Owner priority: ${o.label||"Reserved for owner consideration"}`});
      break;
    }
  }

  return result;
}

// Summarise restriction for a date into a single display colour/icon
function dateRestrictionDisplay(eval_) {
  if(!eval_.restricted) return null;
  const highest = eval_.reasons.reduce((acc,r)=>{
    if(r.severity==="block") return "block";
    if(r.severity==="warn" && acc!=="block") return "warn";
    return acc;
  }, "info");
  if(highest==="block") return {color:"#cf4338", icon:"⛔", opacity:.55};
  if(highest==="warn")  return {color:"#e0b84a", icon:"⚠️", opacity:.65};
  return                       {color:"#6b8cba", icon:"👑", opacity:.75};
}

// ── CHARTER DETAIL PAGE ───────────────────────────────────────
// Opened when a crew member taps a Booked calendar entry.
// Sections are filtered by department role.
// Captain sees everything. Other roles see department-relevant info only.

// ══════════════════════════════════════════════════════════════
// CHARTER DOC UPLOADER — AI preference sheet extraction
// ══════════════════════════════════════════════════════════════
function CharterDocUploader({ charterDetails, onUpdate, onClose, entryTitle, tasks, setTasks, role }) {
  const [phase, setPhase]           = useState("upload");   // upload | extracting | review | taskgen | done
  const [dragOver, setDragOver]     = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);       // {name, type, size, dataUrl}
  const [aiDraft, setAiDraft]       = useState(null);       // extracted fields draft
  const [aiRaw, setAiRaw]           = useState("");         // raw AI response text
  const [editDraft, setEditDraft]   = useState(null);       // captain edits before publishing
  const [error, setError]           = useState("");
  const fileRef = useRef(null);

  const ACCEPTED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const ACCEPTED_EXT = [".pdf",".doc",".docx",".txt"];

  // ── File ingestion ──────────────────────────────────────────
  function handleFile(file) {
    if(!file) return;
    const okType  = ACCEPTED.includes(file.type);
    const okExt   = ACCEPTED_EXT.some(e=>file.name.toLowerCase().endsWith(e));
    if(!okType && !okExt) { setError("Please upload a PDF, Word (.docx/.doc) or text file."); return; }
    if(file.size > 10 * 1024 * 1024) { setError("File must be under 10 MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = e => {
      setCurrentDoc({ name:file.name, type:file.type, size:file.size, dataUrl:e.target.result });
      setPhase("ready");
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  // ── AI extraction via Anthropic API ────────────────────────
  async function runExtraction() {
    if(!currentDoc) return;
    setPhase("extracting");
    setError("");

    // Build the content array — send as base64 document if PDF, else text
    const isPdf = currentDoc.type === "application/pdf" || currentDoc.name.toLowerCase().endsWith(".pdf");
    const isDocx = currentDoc.name.toLowerCase().endsWith(".docx") || currentDoc.name.toLowerCase().endsWith(".doc");

    const systemPrompt = `You are a yacht charter operations assistant. Extract guest preference and operational information from the uploaded document and return ONLY a valid JSON object (no markdown, no commentary) with exactly these keys:

{
  "charterType": "",
  "guestCount": "",
  "guestNotes": "",
  "occasion": "",
  "arrivalFrom": "",
  "arrivalTime": "",
  "arrivalLocation": "",
  "arrivalNotes": "",
  "departureTime": "",
  "departureLocation": "",
  "departureNotes": "",
  "vipGuests": "",
  "specialRequests": "",
  "cabinAssignments": "",
  "cabinPreferences": "",
  "dietaryReqs": "",
  "allergies": "",
  "mealPreferences": "",
  "mealRequests": "",
  "guestFoodPrefs": "",
  "drinkPreferences": "",
  "winePreferences": "",
  "softDrinkPrefs": "",
  "watersportsReqs": "",
  "jetSkiReqs": "",
  "seabobReqs": "",
  "efoilReqs": "",
  "tenderOps": "",
  "beachSetupReqs": "",
  "fuelRequired": "",
  "engineNotes": "",
  "powerReqs": "",
  "equipmentReqs": "",
  "internalNotes": ""
}

Rules:
- Fill only fields you find clear evidence for. Leave others as empty string "".
- allergies: treat as critical — extract any mention of allergies, intolerances or medical dietary restrictions.
- For lists (e.g. per-guest preferences), write them as clear sentences separated by periods.
- internalNotes: operational notes for captain only (logistics, payment terms, VIP protocol).
- Do not invent data. Only extract what is explicitly stated or strongly implied.
- Return ONLY the JSON object. No explanation. No markdown fences.`;

    let userContent;
    if(isPdf) {
      // Send as base64 PDF document block
      const base64 = currentDoc.dataUrl.split(",")[1];
      userContent = [
        { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 } },
        { type:"text", text:`Extract all guest preference and charter operational information from this document for the charter: "${entryTitle}". Return ONLY the JSON object as instructed.` }
      ];
    } else {
      // For Word/text: send content as text (dataUrl is base64 — decode what we can, or note the format)
      userContent = [
        { type:"text", text:`The following is the content of an uploaded document ("${currentDoc.name}") for charter: "${entryTitle}".\n\nNote: This is a ${isDocx?"Word document":"text file"} uploaded by the Captain. Extract all guest preference and charter operational information from it.\n\nFile data (base64): ${currentDoc.dataUrl.split(",")[1].slice(0,8000)}\n\nReturn ONLY the JSON object as instructed.` }
      ];
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role:"user", content: userContent }],
        })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      const raw = data.content.map(b=>b.text||"").join("").trim();
      setAiRaw(raw);
      // Parse JSON
      let parsed;
      try {
        const clean = raw.replace(/```json|```/g,"").trim();
        parsed = JSON.parse(clean);
      } catch(_) {
        throw new Error("AI returned an unexpected format. Please try again or enter details manually.");
      }
      setAiDraft(parsed);
      setEditDraft({...parsed});
      setPhase("review");
    } catch(err) {
      setError(err.message || "Extraction failed. Please try again.");
      setPhase("ready");
    }
  }

  // ── Publish: merge draft into charter details ───────────────
  function publish() {
    const docs = [...(charterDetails?.uploadedDocs||[]), {
      id:       `doc_${Date.now()}`,
      name:     currentDoc.name,
      type:     currentDoc.type,
      size:     currentDoc.size,
      dataUrl:  currentDoc.dataUrl,
      uploadedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      aiExtracted: aiDraft,
      published: true,
    }];
    // Merge editDraft into charterDetails, skipping empty values unless captain cleared them
    const merged = { ...(charterDetails||{...EMPTY_CHARTER_DETAILS}) };
    Object.entries(editDraft).forEach(([k,v])=>{
      if(v && v.toString().trim()) merged[k] = v;
    });
    merged.uploadedDocs = docs;
    onUpdate(merged);
    setPhase("done");
  }

  function publish() {
    const docs = [...(charterDetails?.uploadedDocs||[]), {
      id:       `doc_${Date.now()}`,
      name:     currentDoc.name,
      type:     currentDoc.type,
      size:     currentDoc.size,
      dataUrl:  currentDoc.dataUrl,
      uploadedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      aiExtracted: aiDraft,
      published: true,
    }];
    const merged = { ...(charterDetails||{...EMPTY_CHARTER_DETAILS}) };
    Object.entries(editDraft).forEach(([k,v])=>{
      if(v && v.toString().trim()) merged[k] = v;
    });
    merged.uploadedDocs = docs;
    onUpdate(merged);
    // If tasks wiring available, go to task generation step
    if(setTasks) {
      setGeneratedTasks(buildTasksFromPreferenceSheet(editDraft, entryTitle));
      setSelectedTasks(new Set(buildTasksFromPreferenceSheet(editDraft, entryTitle).map((_,i)=>i)));
      setPhase("taskgen");
    } else {
      setPhase("done");
    }
  }

  // ── Auto-generate department tasks from extracted charter data ──
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTasks,  setSelectedTasks]  = useState(new Set());

  function buildTasksFromPreferenceSheet(d, charterTitle) {
    const tasks = [];
    const src   = `Preference sheet: ${currentDoc?.name||"upload"}`;
    const add   = (title, dept, assignedTo, priority="Medium", notes="") => {
      tasks.push({ title, dept, assignedTo, priority, notes,
        recurrence:"One-off", category:"Guest Prep",
        dueDate:"", desc:"", photos:[],
        importedFrom:src, importedAt:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
        charterRef: charterTitle,
      });
    };

    // CHEF tasks
    if(d.allergies&&d.allergies!=="None declared"&&d.allergies!=="N/A")
      add(`ALLERGY BRIEF: Confirm allergy protocol — ${d.allergies}`, "Galley", "chef", "Critical", d.allergies);
    if(d.dietaryReqs)
      add(`Prepare for dietary requirements: ${d.dietaryReqs}`, "Galley", "chef", "High", d.dietaryReqs);
    if(d.mealPreferences||d.mealRequests)
      add(`Plan menu per guest preferences`, "Galley", "chef", "Medium", [d.mealPreferences,d.mealRequests].filter(Boolean).join(" · "));
    if(d.guestFoodPrefs)
      add(`Per-guest food preferences: ${d.guestFoodPrefs.slice(0,60)}`, "Galley", "chef", "Medium", d.guestFoodPrefs);

    // STEW tasks
    if(d.cabinPreferences||d.cabinAssignments)
      add(`Set up cabins: ${d.cabinAssignments||d.cabinPreferences}`, "Interior", "stew", "High", d.cabinPreferences||"");
    if(d.specialRequests)
      add(`Special requests: ${d.specialRequests.slice(0,60)}`, "Interior", "stew", "High", d.specialRequests);
    if(d.vipGuests)
      add(`VIP protocol briefing — ${d.vipGuests}`, "Interior", "stew", "Critical", d.vipGuests);
    if(d.drinkPreferences||d.winePreferences)
      add(`Stock drinks per guest preferences`, "Interior", "stew", "High", [d.drinkPreferences,d.winePreferences].filter(Boolean).join(" · "));

    // DECK tasks
    if(d.watersportsReqs||d.jetSkiReqs||d.seabobReqs||d.efoilReqs) {
      const ws = [d.watersportsReqs,d.jetSkiReqs,d.seabobReqs,d.efoilReqs].filter(Boolean).join(", ");
      add(`Prepare watersports: ${ws.slice(0,60)}`, "Deck", "deckhand", "High", ws);
    }
    if(d.tenderOps)
      add(`Tender ops: ${d.tenderOps.slice(0,60)}`, "Deck", "deckhand", "Medium", d.tenderOps);
    if(d.beachSetupReqs)
      add(`Beach setup: ${d.beachSetupReqs.slice(0,60)}`, "Deck", "deckhand", "Medium", d.beachSetupReqs);

    // CAPTAIN / ENGINEERING tasks
    if(d.fuelRequired)
      add(`Fuel: ${d.fuelRequired}`, "Engineering", "engineer", "High", d.fuelRequired);
    if(d.engineNotes)
      add(`Engineering note: ${d.engineNotes.slice(0,60)}`, "Engineering", "engineer", "Medium", d.engineNotes);
    if(d.powerReqs)
      add(`Power requirements: ${d.powerReqs}`, "Engineering", "engineer", "Medium", d.powerReqs);
    if(d.internalNotes)
      add(`Captain note: ${d.internalNotes.slice(0,60)}`, "Captain", "captain", "High", d.internalNotes);

    return tasks;
  }

  function importSelectedTasks() {
    if(!setTasks) { setPhase("done"); return; }
    const toCreate = generatedTasks
      .filter((_,i) => selectedTasks.has(i))
      .map(t => ({
        ...EMPTY_FORM, ...t,
        id:         Date.now() + Math.random(),
        status:     "Pending",
        assignedBy: role||"captain",
        completedAt:null, approvedBy:null,
      }));
    if(toCreate.length > 0) setTasks(p=>[...p, ...toCreate]);
    setPhase("done");
  }

  // ── Field editor in review phase ────────────────────────────
  const DeptSection = ({title, icon, color, fields}) => {
    const hasAny = fields.some(([k])=>editDraft[k]);
    return <div style={{background:C.card,border:`1px solid ${color}44`,borderLeft:`3px solid ${color}`,borderRadius:9,padding:"12px 14px",marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
        <span>{icon}</span><span>{title}</span>
        {!hasAny&&<span style={{fontSize:9,color:C.muted,fontWeight:400,marginLeft:"auto"}}>Nothing extracted</span>}
      </div>
      {fields.map(([k,label,multi])=>(
        <div key={k} style={{marginBottom:7}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:2,display:"flex",alignItems:"center",gap:6}}>
            {label}
            {k==="allergies"&&editDraft[k]&&<span style={{color:C.signal,fontWeight:700,fontSize:9}}>ALLERGY</span>}
          </div>
          {multi
            ? <textarea value={editDraft[k]||""} onChange={e=>setEditDraft(p=>({...p,[k]:e.target.value}))} rows={2}
                style={{...inp,width:"100%",padding:"5px 8px",fontSize:11,resize:"vertical",lineHeight:1.5,
                  border:editDraft[k]?`1px solid ${color}66`:`1px solid ${C.border}`,background:editDraft[k]?`${color}08`:C.navyLight}}/>
            : <input value={editDraft[k]||""} onChange={e=>setEditDraft(p=>({...p,[k]:e.target.value}))}
                style={{...inp,width:"100%",padding:"5px 8px",fontSize:11,
                  border:editDraft[k]?`1px solid ${color}66`:`1px solid ${C.border}`,background:editDraft[k]?`${color}08`:C.navyLight}}/>}
        </div>
      ))}
    </div>;
  };

  const fileSizeLabel = bytes => bytes>1024*1024 ? `${(bytes/1024/1024).toFixed(1)} MB` : `${Math.round(bytes/1024)} KB`;

  return <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.97)",zIndex:900,overflowY:"auto",display:"flex",justifyContent:"center"}}
    onClick={onClose}>
    <div style={{width:"min(680px,100%)",padding:"20px 16px 60px"}} onClick={e=>e.stopPropagation()}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <button onClick={onClose} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 14px",fontSize:12,marginBottom:10}}>← Back</button>
          <div style={{fontSize:17,fontWeight:800,color:C.white,display:"flex",alignItems:"center",gap:8}}><Ico i={Paperclip} s={16} c={C.white}/>{"Upload Preference Document"}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{entryTitle}</div>
        </div>
        <div style={{fontSize:10,background:`${C.brass}22`,color:C.brass,padding:"4px 10px",borderRadius:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,flexShrink:0,alignSelf:"flex-start",marginTop:36}}>
          {"AI Powered"}
        </div>
      </div>

      {/* Progress stepper */}
      {(()=>{
        const steps = ["Upload","Extract","Review","Done"];
        const idx   = {upload:0,ready:0,extracting:1,review:2,done:3}[phase]??0;
        return <div style={{display:"flex",alignItems:"center",marginBottom:20,gap:0}}>
          {steps.map((s,i)=><>
            <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,
                background:i<idx?C.green:i===idx?C.brass:C.navyLight,
                color:i<=idx?C.bg:C.muted,border:`2px solid ${i<idx?C.green:i===idx?C.brass:C.border}`}}>
                {i<idx?"✓":i+1}
              </div>
              <div style={{fontSize:9,color:i===idx?C.brass:i<idx?C.green:C.muted,fontWeight:i===idx?700:400,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{s}</div>
            </div>
            {i<steps.length-1&&<div key={`line_${i}`} style={{flex:1,height:2,background:i<idx?C.green:C.border,margin:"0 4px",marginBottom:14}}/>}
          </>)}
        </div>;
      })()}

      {error&&<div style={{background:C.signal+"18",border:`1px solid ${C.signal}44`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.signal,display:"flex",gap:8,alignItems:"flex-start"}}>
        <Ico i={AlertTriangle} s={14} c={C.signal}/><span>{error}</span>
      </div>}

      {/* ── PHASE: upload / ready ── */}
      {(phase==="upload"||phase==="ready")&&<>
        {/* Drop zone */}
        <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
          onClick={()=>!currentDoc&&fileRef.current?.click()}
          style={{border:`2px dashed ${dragOver?C.brass:currentDoc?C.green:C.border}`,borderRadius:12,
            padding:"32px 20px",textAlign:"center",background:dragOver?`${C.brass}08`:currentDoc?`${C.green}08`:C.navyLight,
            cursor:currentDoc?"default":"pointer",transition:"all .15s",marginBottom:14}}>
          {currentDoc ? <>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={FileText} s={28} c={C.greenL}/></div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{currentDoc.name}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{fileSizeLabel(currentDoc.size)}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={e=>{e.stopPropagation();setCurrentDoc(null);setPhase("upload");}}
                style={{...btn,background:C.navyMid,color:C.muted,border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:11}}>
                {"✕ Remove"}
              </button>
              <button onClick={e=>{e.stopPropagation();fileRef.current?.click();}}
                style={{...btn,background:C.navy,color:C.white,border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:11}}>
                {"↩ Replace"}
              </button>
            </div>
          </> : <>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={FolderOpen} s={36} c={C.muted}/></div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>Drop document here</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12,lineHeight:1.6}}>
              Preference sheets, guest profiles, charter briefs<br/>
              <span style={{color:C.brass}}>PDF · Word (.docx) · Text (.txt)</span> · Max 10 MB
            </div>
            <div style={{...btn,background:C.brass,color:C.bg,display:"inline-block",padding:"8px 22px",fontSize:12}}>Browse Files</div>
          </>}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{display:"none"}}
          onChange={e=>handleFile(e.target.files[0])}/>

        {/* What AI will extract */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>What AI will extract</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
            {[
              [C.orange,ChefHat,"Chef","Allergies, dietary reqs, meal preferences, food requests"],
              [C.purple,Star,"Stew","Drinks, wines, cabin prefs, guest requests"],
              [C.green,Sailboat,"Deck","Watersports, jet ski, seabob, e-foil, beach setup"],
              [C.brassL,Compass,"Captain","VIP protocol, logistics, operational notes"],
            ].map(([col,IC,dept,desc])=><div key={dept} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{flexShrink:0,marginTop:1}}><Ico i={IC} s={14} c={col}/></div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:col}}>{dept}</div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{desc}</div>
              </div>
            </div>)}
          </div>
        </div>

        {/* Existing docs */}
        {charterDetails?.uploadedDocs?.length>0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Previously uploaded</div>
          {charterDetails.uploadedDocs.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
            <Ico i={FileText} s={14} c={C.muted}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:C.text,fontWeight:600}}>{d.name}</div>
              <div style={{fontSize:9,color:C.muted}}>{d.uploadedAt} · {fileSizeLabel(d.size)}</div>
            </div>
            {d.published&&<span style={{fontSize:9,background:C.green+"22",color:C.green,padding:"2px 7px",borderRadius:6,fontWeight:700}}>Published</span>}
          </div>)}
        </div>}

        <button onClick={runExtraction} disabled={!currentDoc}
          style={{...btn,width:"100%",background:currentDoc?C.brass:C.navyLight,color:currentDoc?C.bg:C.muted,
            padding:"12px 0",fontSize:13,fontWeight:700,opacity:currentDoc?1:.6}}>
          {"Extract with AI →"}
        </button>
      </>}

      {/* ── PHASE: extracting ── */}
      {phase==="extracting"&&<div style={{textAlign:"center",padding:"48px 20px"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Ico i={Bot} s={48} c={C.brass} style={{animation:"spin 1s linear infinite"}}/></div>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>Reading document…</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          Identifying guests · Extracting preferences<br/>
          Categorising by department · Building summary
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>}

      {/* ── PHASE: review ── */}
      {phase==="review"&&editDraft&&<>
        <div style={{background:`${C.green}12`,border:`1px solid ${C.green}44`,borderRadius:9,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
          <Ico i={CheckCircle} s={16} c={C.greenL}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.green}}>Extraction complete — review before publishing</div>
            <div style={{fontSize:11,color:C.muted}}>AI has pre-filled the fields below. Edit anything before saving to the charter.</div>
          </div>
        </div>

        <div style={{fontSize:10,color:C.muted,marginBottom:10,fontStyle:"italic"}}>
          Highlighted fields were extracted from the document. Empty fields were not found — you can fill them manually.
        </div>

        <DeptSection title="Chef — Dietary & Provisions" iconC={ChefHat} color={C.orange} fields={[
          ["allergies",       "Allergies / intolerances"],
          ["dietaryReqs",     "Dietary requirements",    false],
          ["mealPreferences", "Meal preferences",        false],
          ["mealRequests",    "Specific meal requests",  true],
          ["guestFoodPrefs",  "Per-guest food prefs",    true],
        ]}/>

        <DeptSection title="Stew — Drinks & Interior" iconC={Star} color={C.purple} fields={[
          ["drinkPreferences","Drink preferences",       false],
          ["winePreferences", "Wine / champagne",        false],
          ["softDrinkPrefs",  "Soft drinks / water",     false],
          ["cabinAssignments","Cabin assignments",        false],
          ["cabinPreferences","Cabin preferences",        true],
          ["specialRequests", "Special requests",         true],
          ["vipGuests",       "VIP guests / protocol",   false],
          ["guestNotes",      "Guest notes",              true],
        ]}/>

        <DeptSection title="Deck — Watersports & Toys" iconC={Sailboat} color={C.green} fields={[
          ["watersportsReqs","General watersports",      false],
          ["jetSkiReqs",     "Jet ski requests",         false],
          ["seabobReqs",     "Seabob requests",          false],
          ["efoilReqs",      "E-Foil requests",          false],
          ["tenderOps",      "Tender requirements",      false],
          ["beachSetupReqs", "Beach setup",               true],
        ]}/>

        <DeptSection title="Captain — Operational" iconC={Compass} color={C.brassL} fields={[
          ["arrivalTime",      "Arrival time",            false],
          ["arrivalLocation",  "Arrival location",        false],
          ["arrivalFrom",      "Travelling from",         false],
          ["arrivalNotes",     "Arrival notes",            true],
          ["departureTime",    "Departure time",          false],
          ["departureLocation","Departure location",      false],
          ["departureNotes",   "Departure notes",          true],
          ["fuelRequired",     "Fuel required",           false],
          ["engineNotes",      "Engine notes",             true],
          ["powerReqs",        "Power requirements",       true],
          ["equipmentReqs",    "Equipment requests",       true],
          ["internalNotes",    "Internal / VIP notes",     true],
          ["occasion",         "Occasion",                false],
          ["guestCount",       "Guest count",             false],
        ]}/>

        <div style={{display:"flex",gap:9,marginTop:6}}>
          <button onClick={()=>setPhase("ready")} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"10px 0"}}>
            {"← Back"}
          </button>
          <button onClick={publish} style={{...btn,flex:2,background:C.green,color:C.bg,padding:"10px 0",fontSize:13,fontWeight:800}}>
            {"✓ Publish to Charter →"}
          </button>
        </div>
      </>}

      {/* ── PHASE: done ── */}
      {/* ── TASK GENERATION REVIEW ── */}
      {phase==="taskgen"&&<div>
        <div style={{background:`${C.brass}12`,border:`1px solid ${C.brass}33`,borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.brass}}>
          {"AI generated "}{generatedTasks.length}{" prep tasks from this preference sheet. Review, deselect any you don't need, then approve."}
        </div>

        <div style={{display:"flex",gap:7,marginBottom:12}}>
          <button onClick={()=>setSelectedTasks(new Set(generatedTasks.map((_,i)=>i)))} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:11}}>{"Select all"}</button>
          <button onClick={()=>setSelectedTasks(new Set())} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:11}}>{"Deselect all"}</button>
          <span style={{fontSize:11,color:C.muted,alignSelf:"center",marginLeft:"auto"}}>{selectedTasks.size}{" of "}{generatedTasks.length}{" selected"}</span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16,maxHeight:"42vh",overflowY:"auto"}}>
          {generatedTasks.map((t,i)=>{
            const sel = selectedTasks.has(i);
            const dc  = {Galley:C.orange,Interior:C.purple,Deck:C.greenL,Engineering:C.blue,Captain:C.brass}[t.dept]||C.muted;
            return (
              <div key={i} onClick={()=>setSelectedTasks(p=>{const s=new Set(p);s.has(i)?s.delete(i):s.add(i);return s;})}
                style={{display:"flex",alignItems:"flex-start",gap:9,background:sel?C.navyLight:C.card,border:`1px solid ${sel?dc+"44":C.border}`,borderLeft:`3px solid ${sel?dc:C.border}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",opacity:sel?1:.55}}>
                <input type="checkbox" checked={sel} onChange={()=>{}} style={{marginTop:3,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,marginBottom:4}}>{t.title}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,background:dc+"22",color:dc,padding:"2px 8px",borderRadius:8,fontWeight:700}}>{t.dept}</span>
                    <span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:"2px 8px",borderRadius:8}}>{t.assignedTo}</span>
                    {t.priority==="Critical"&&<span style={{fontSize:10,background:C.signal+"22",color:C.signal,padding:"2px 8px",borderRadius:8,fontWeight:700}}>{"Critical"}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>setPhase("done")} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`}}>{"Skip"}</button>
          <button onClick={importSelectedTasks} disabled={selectedTasks.size===0}
            style={{...btn,flex:2,background:selectedTasks.size>0?C.brass:C.navyLight,color:selectedTasks.size>0?C.bg:C.muted,fontWeight:700,opacity:selectedTasks.size>0?1:.6}}>
            {"Create "}{selectedTasks.size}{" Task"}{selectedTasks.size!==1?"s":""}{" → Task List"}
          </button>
        </div>
      </div>}

      {phase==="done"&&<div style={{textAlign:"center",padding:"48px 20px"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Ico i={CheckCircle} s={48} c={C.greenL}/></div>
        <div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:8}}>{"Charter updated"}</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8,marginBottom:24}}>
          {"Document saved · AI summary published to charter"}<br/>
          {"All departments will see their relevant information."}
        </div>
        <button onClick={onClose} style={{...btn,background:C.brass,color:C.bg,padding:"10px 28px",fontSize:13,fontWeight:700}}>
          {"Done"}
        </button>
      </div>}

    </div>
  </div>;
}


const CHARTER_DEPT_VISIBILITY = {
  arrival:     ["captain","management","deckhand","stew","engineer","chef","owner","agent"],
  departure:   ["captain","management","deckhand","stew","engineer","chef","owner","agent"],
  guests:      ["captain","management","stew","owner"],
  stew:        ["captain","management","stew","owner"],
  chef:        ["captain","management","chef"],
  watersports: ["captain","management","deckhand"],
  engineering: ["captain","management","engineer"],
  internal:    ["captain","management"],
};
function canSeeSection(role, section) {
  return (CHARTER_DEPT_VISIBILITY[section]||[]).includes(role);
}

// ── Shared sub-components ──────────────────────────────────────
function ChRow({label, value, alert, highlight}) {
  if(!value) return null;
  return <div style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",alignItems:"flex-start"}}>
    <div style={{fontSize:11,color:C.muted,minWidth:140,flexShrink:0,paddingTop:1}}>{label}</div>
    <div style={{fontSize:12,color:alert?C.signal:highlight?C.brassL:C.white,fontWeight:alert||highlight?700:400,flex:1,lineHeight:1.6}}>{value}</div>
  </div>;
}

function ChSection({icon, iconC, title, accent, children}) {
  const col = accent||C.brass;
  const hasContent = Array.isArray(children)
    ? children.some(c=>c!=null&&c!==false)
    : children!=null&&children!==false;
  if(!hasContent) return null;
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${col}`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
    <div style={{fontSize:11,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
      {iconC?<Ico i={iconC} s={13} c={col}/>:<span>{icon}</span>}<span>{title}</span>
    </div>
    {children}
  </div>;
}

// ── Role-specific dept view banners ────────────────────────────
const DEPT_META = {
  chef:     { label:"Galley & Provisions View",        IconC:ChefHat,    color:C.orange,
              note:"Showing food, dietary and provisioning information only." },
  stew:     { label:"Interior & Guest Services View",  IconC:Star,       color:C.purple,
              note:"Showing guest preferences, drinks, cabin and service information only." },
  deckhand: { label:"Deck Operations View",            IconC:Sailboat,   color:C.green,
              note:"Showing watersports, tender and deck setup information only." },
  engineer: { label:"Engineering & Technical View",    IconC:Wrench,     color:C.blue,
              note:"Showing technical, power and equipment information only." },
  captain:  { label:"Full Charter Overview",           IconC:Compass,    color:C.brassL, note:null },
  management:{ label:"Full Charter Overview",          IconC:Building2,  color:C.brassL, note:null },
  owner:    { label:"Owner Overview",                  IconC:Anchor,     color:C.brass,  note:null },
  agent:    { label:"Agent View",                      IconC:Handshake,  color:"#3b9fd4",
              note:"Showing schedule and availability information only." },
};

// ══════════════════════════════════════════════════════════════
// CHARTER DETAIL PAGE
// ══════════════════════════════════════════════════════════════
function CharterDetailPage({entry, role, onClose, onEdit, onUpload}) {
  const d = entry.charterDetails || {};
  const nights = Math.max(0, Math.round((new Date(entry.end)-new Date(entry.start))/(1000*60*60*24)));
  const canEdit = ["captain","management"].includes(role);
  const meta = DEPT_META[role] || DEPT_META.captain;

  // ── CHEF VIEW ──────────────────────────────────────────────
  const ChefView = () => <>
    {/* Allergy alert — always first */}
    {d.allergies&&<div style={{background:C.signal+"18",border:`2px solid ${C.signal}55`,borderRadius:10,padding:"12px 16px",marginBottom:10,display:"flex",gap:10,alignItems:"flex-start"}}>
      <div style={{flexShrink:0,marginTop:2}}><Ico i={AlertTriangle} s={20} c={C.signal}/></div>
      <div>
        <div style={{fontSize:12,fontWeight:800,color:C.signal,marginBottom:3}}>ALLERGY ALERT</div>
        <div style={{fontSize:13,color:C.text,fontWeight:600,lineHeight:1.5}}>{d.allergies}</div>
      </div>
    </div>}

    <ChSection iconC={ChefHat} title="Dietary Requirements" accent={C.orange}>
      <ChRow label="Dietary requirements"  value={d.dietaryReqs}/>
      <ChRow label="Allergies / intolerances" value={d.allergies} alert/>
      <ChRow label="Meal preferences"      value={d.mealPreferences}/>
      <ChRow label="Specific meal requests" value={d.mealRequests} highlight/>
    </ChSection>

    <ChSection iconC={User} title="Per-Guest Food Preferences" accent={C.orange}>
      <ChRow label="Guest preferences" value={d.guestFoodPrefs}/>
    </ChSection>

    <ChSection iconC={Coffee} title="Drink Provisioning" accent={C.orange}>
      <ChRow label="Drink preferences"  value={d.drinkPreferences}/>
      <ChRow label="Wine / champagne"   value={d.winePreferences}/>
      <ChRow label="Soft drinks / water" value={d.softDrinkPrefs}/>
    </ChSection>

    {/* Context: timing only — helps chef plan meals */}
    <ChSection iconC={Calendar} title="Schedule Context" accent={C.muted}>
      <ChRow label="Charter dates"   value={`${entry.start} → ${entry.end}`}/>
      <ChRow label="Duration"        value={nights>0?`${nights} night${nights!==1?"s":""}`:entry.start===entry.end?"Day charter":null}/>
      <ChRow label="Guest count"     value={d.guestCount?`${d.guestCount} guests`:null}/>
      <ChRow label="Occasion"        value={d.occasion}/>
    </ChSection>
  </>;

  // ── STEW VIEW ──────────────────────────────────────────────
  const StewView = () => <>
    {d.vipGuests&&<div style={{background:C.amber+"18",border:`1px solid ${C.amber}55`,borderRadius:10,padding:"11px 14px",marginBottom:10,fontSize:12,color:C.amber,fontWeight:700,display:"flex",gap:8,alignItems:"center"}}>
      <Ico i={Crown} s={14} c={C.amber}/>{"VIP: "}{d.vipGuests}
    </div>}

    <ChSection iconC={Star} title="Guest Profile & Notes" accent={C.purple}>
      <ChRow label="Guest notes"        value={d.guestNotes}/>
      <ChRow label="Occasion"           value={d.occasion}/>
      <ChRow label="VIP guests"         value={d.vipGuests} highlight/>
      <ChRow label="Special requests"   value={d.specialRequests}/>
    </ChSection>

    <ChSection iconC={BookOpen} title="Cabin Preferences" accent={C.purple}>
      <ChRow label="Cabin assignments"  value={d.cabinAssignments}/>
      <ChRow label="Cabin preferences"  value={d.cabinPreferences} highlight/>
    </ChSection>

    <ChSection iconC={Coffee} title="Drinks Service" accent={C.purple}>
      <ChRow label="Drink preferences"   value={d.drinkPreferences}/>
      <ChRow label="Wine / champagne"    value={d.winePreferences} highlight/>
      <ChRow label="Soft drinks / water" value={d.softDrinkPrefs}/>
    </ChSection>

    <ChSection iconC={Navigation} title="Arrival & Departure" accent={C.muted}>
      <ChRow label="Arrival time"        value={d.arrivalTime}/>
      <ChRow label="Pick-up location"    value={d.arrivalLocation}/>
      <ChRow label="Arrival notes"       value={d.arrivalNotes}/>
      <ChRow label="Departure time"      value={d.departureTime}/>
      <ChRow label="Drop-off location"   value={d.departureLocation}/>
      <ChRow label="Departure notes"     value={d.departureNotes}/>
    </ChSection>
  </>;

  // ── DECKHAND / DECK VIEW ───────────────────────────────────
  const DeckView = () => <>
    <ChSection iconC={Sailboat} title="Watersports Requests" accent={C.green}>
      <ChRow label="General watersports" value={d.watersportsReqs} highlight/>
      <ChRow label="Jet Ski"             value={d.jetSkiReqs}/>
      <ChRow label="Seabob"              value={d.seabobReqs}/>
      <ChRow label="E-Foil"              value={d.efoilReqs}/>
    </ChSection>

    <ChSection iconC={Ship} title="Tender Operations" accent={C.green}>
      <ChRow label="Tender requirements" value={d.tenderOps} highlight/>
    </ChSection>

    <ChSection iconC={Umbrella} title="Beach & Deck Setup" accent={C.green}>
      <ChRow label="Beach setup" value={d.beachSetupReqs} highlight/>
    </ChSection>

    <ChSection iconC={Navigation} title="Arrival & Departure" accent={C.muted}>
      <ChRow label="Arrival time"      value={d.arrivalTime}/>
      <ChRow label="Pick-up location"  value={d.arrivalLocation}/>
      <ChRow label="Arrival notes"     value={d.arrivalNotes}/>
      <ChRow label="Departure time"    value={d.departureTime}/>
      <ChRow label="Drop-off location" value={d.departureLocation}/>
    </ChSection>

    <ChSection iconC={Calendar} title="Schedule Context" accent={C.muted}>
      <ChRow label="Charter dates" value={`${entry.start} → ${entry.end}`}/>
      <ChRow label="Duration"      value={nights>0?`${nights} night${nights!==1?"s":""}`:entry.start===entry.end?"Day charter":null}/>
      <ChRow label="Guests"        value={d.guestCount?`${d.guestCount} guests`:null}/>
    </ChSection>
  </>;

  // ── ENGINEER VIEW ──────────────────────────────────────────
  const EngineerView = () => <>
    <ChSection iconC={Settings} title="Technical Requirements" accent={C.blue}>
      <ChRow label="Fuel required"   value={d.fuelRequired} highlight/>
      <ChRow label="Engine notes"    value={d.engineNotes}/>
      <ChRow label="Power requirements" value={d.powerReqs}/>
      <ChRow label="Equipment requests" value={d.equipmentReqs}/>
    </ChSection>

    <ChSection iconC={Calendar} title="Schedule & Passage" accent={C.muted}>
      <ChRow label="Charter dates"  value={`${entry.start} → ${entry.end}`}/>
      <ChRow label="Duration"       value={nights>0?`${nights} night${nights!==1?"s":""}`:entry.start===entry.end?"Day charter":null}/>
      <ChRow label="Arrival time"   value={d.arrivalTime}/>
      <ChRow label="Departure time" value={d.departureTime}/>
      <ChRow label="Guest count"    value={d.guestCount?`${d.guestCount} guests`:null}/>
    </ChSection>
  </>;

  // ── CAPTAIN / MANAGEMENT / OWNER FULL VIEW ─────────────────
  const FullView = () => <>
    {/* Charter Summary */}
    <div style={{background:`${C.brass}10`,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ico i={ClipboardList} s={11} c={C.brass}/>{"Charter Summary"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px"}}>
        {[
          ["Charter Type", d.charterType],
          ["Dates",        `${entry.start} → ${entry.end}`],
          ["Duration",     nights>0?`${nights} night${nights!==1?"s":""}`:entry.start===entry.end?"Day charter":null],
          ["Guests",       d.guestCount?`${d.guestCount} guests`:null],
          ["Times",        entry.startTime&&entry.endTime?`${entry.startTime} → ${entry.endTime}`:null],
          ["Occasion",     d.occasion],
        ].map(([k,v])=>v?<div key={k} style={{padding:"4px 0",fontSize:12}}>
          <span style={{color:C.muted,marginRight:6}}>{k}:</span>
          <span style={{color:C.text,fontWeight:600}}>{v}</span>
        </div>:null)}
      </div>
      {d.guestNotes&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.brass}33`,fontSize:12,color:C.text,lineHeight:1.6}}>
        <span style={{color:C.muted}}>Guest notes: </span>{d.guestNotes}
      </div>}
    </div>

    {d.vipGuests&&<div style={{background:C.amber+"18",border:`1px solid ${C.amber}55`,borderRadius:10,padding:"11px 14px",marginBottom:10,fontSize:12,color:C.amber,fontWeight:700,display:"flex",gap:8,alignItems:"center"}}>
      <Ico i={Crown} s={14} c={C.amber}/>{"VIP: "}{d.vipGuests}
    </div>}

    {d.allergies&&<div style={{background:C.signal+"18",border:`2px solid ${C.signal}55`,borderRadius:10,padding:"11px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"flex-start"}}>
      <Ico i={AlertTriangle} s={18} c={C.signal}/>
      <div><div style={{fontSize:11,fontWeight:800,color:C.signal,marginBottom:2}}>ALLERGY ALERT</div>
      <div style={{fontSize:12,color:C.text,fontWeight:600}}>{d.allergies}</div></div>
    </div>}

    {/* Arrival */}
    <ChSection iconC={Navigation} title="Arrival" accent={C.brassL}>
      <ChRow label="Arrival time"      value={d.arrivalTime}/>
      <ChRow label="Pick-up location"  value={d.arrivalLocation}/>
      <ChRow label="Travelling from"   value={d.arrivalFrom}/>
      <ChRow label="Arrival notes"     value={d.arrivalNotes}/>
    </ChSection>

    {/* Departure */}
    <ChSection iconC={Ship} title="Departure" accent={C.brassL}>
      <ChRow label="Departure time"    value={d.departureTime}/>
      <ChRow label="Drop-off location" value={d.departureLocation}/>
      <ChRow label="Departure notes"   value={d.departureNotes}/>
    </ChSection>

    {/* Guest Requirements */}
    {canSeeSection(role,"guests")&&<ChSection iconC={Star} title="Guest Requirements" accent={C.purple}>
      <ChRow label="Special requests"  value={d.specialRequests}/>
      <ChRow label="Cabin assignments" value={d.cabinAssignments}/>
      <ChRow label="Cabin preferences" value={d.cabinPreferences}/>
    </ChSection>}

    {/* Stew / Interior */}
    {canSeeSection(role,"stew")&&<ChSection iconC={Coffee} title="Drinks & Interior Service" accent={C.purple}>
      <ChRow label="Drink preferences"   value={d.drinkPreferences}/>
      <ChRow label="Wine / champagne"    value={d.winePreferences}/>
      <ChRow label="Soft drinks / water" value={d.softDrinkPrefs}/>
    </ChSection>}

    {/* Dietary / Chef */}
    {canSeeSection(role,"chef")&&<ChSection iconC={ChefHat} title="Dietary & Galley" accent={C.orange}>
      <ChRow label="Dietary requirements"  value={d.dietaryReqs}/>
      <ChRow label="Allergies"             value={d.allergies} alert/>
      <ChRow label="Meal preferences"      value={d.mealPreferences}/>
      <ChRow label="Specific meal requests"value={d.mealRequests}/>
      <ChRow label="Per-guest preferences" value={d.guestFoodPrefs}/>
    </ChSection>}

    {/* Deck */}
    {canSeeSection(role,"watersports")&&<ChSection iconC={Sailboat} title="Deck & Watersports" accent={C.green}>
      <ChRow label="General watersports" value={d.watersportsReqs}/>
      <ChRow label="Jet Ski"             value={d.jetSkiReqs}/>
      <ChRow label="Seabob"              value={d.seabobReqs}/>
      <ChRow label="E-Foil"             value={d.efoilReqs}/>
      <ChRow label="Tender ops"          value={d.tenderOps}/>
      <ChRow label="Beach setup"         value={d.beachSetupReqs}/>
    </ChSection>}

    {/* Engineering */}
    {canSeeSection(role,"engineering")&&<ChSection iconC={Settings} title="Engineering & Technical" accent={C.blue}>
      <ChRow label="Fuel required"      value={d.fuelRequired}/>
      <ChRow label="Engine notes"       value={d.engineNotes}/>
      <ChRow label="Power requirements" value={d.powerReqs}/>
      <ChRow label="Equipment requests" value={d.equipmentReqs}/>
    </ChSection>}

    {/* Internal */}
    {canSeeSection(role,"internal")&&(d.internalNotes||d.agentName)&&
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
          <><Ico i={Lock} s={11} c={C.muted}/><span>Internal — Captain & Management Only</span></>
        </div>
        {d.agentName&&<ChRow label="Booking agent"   value={`${d.agentName}${d.agentContact?` · ${d.agentContact}`:""}`}/>}
        {d.internalNotes&&<ChRow label="Internal notes" value={d.internalNotes}/>}
      </div>}
  </>;

  // ── AGENT VIEW (schedule only) ─────────────────────────────
  const AgentView = () => <>
    <ChSection iconC={Calendar} title="Schedule" accent={"#3b9fd4"}>
      <ChRow label="Charter dates"  value={`${entry.start} → ${entry.end}`}/>
      <ChRow label="Duration"       value={nights>0?`${nights} night${nights!==1?"s":""}`:entry.start===entry.end?"Day charter":null}/>
      <ChRow label="Charter type"   value={d.charterType}/>
      <ChRow label="Arrival time"   value={d.arrivalTime}/>
      <ChRow label="Departure time" value={d.departureTime}/>
    </ChSection>
  </>;

  // ── Pick the correct view ──────────────────────────────────
  const renderView = () => {
    if(!entry.charterDetails) return null;
    switch(role) {
      case "chef":     return <ChefView/>;
      case "stew":     return <StewView/>;
      case "deckhand": return <DeckView/>;
      case "engineer": return <EngineerView/>;
      case "agent":    return <AgentView/>;
      default:         return <FullView/>; // captain, management, owner
    }
  };

  return <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.97)",zIndex:800,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",touchAction:"pan-y",display:"flex",justifyContent:"center"}}>
    <div style={{width:"min(700px,100%)",padding:"16px 16px 80px",minHeight:"100%"}}>

      {/* Sticky back bar */}
      <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(7,16,31,.95)",backdropFilter:"blur(8px)",padding:"10px 0 10px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onClose} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"8px 16px",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
          {"← Calendar"}
        </button>
        {canEdit&&<div style={{display:"flex",gap:7}}>
          {onUpload&&<button onClick={onUpload} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"8px 14px",fontSize:12}}>{"Upload"}</button>}
          <button onClick={onEdit} style={{...btn,background:C.brass,color:C.bg,padding:"8px 16px",fontSize:12,fontWeight:700}}>{"Edit"}</button>
        </div>}
      </div>

      {/* Header card */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:19,fontWeight:800,color:C.navy,lineHeight:1.2,marginBottom:8}}>{entry.title}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
              {d.charterType&&<span style={{fontSize:10,background:C.brass+"22",color:C.brass,padding:"2px 9px",borderRadius:8,fontWeight:700}}>⛵ {d.charterType}</span>}
              <span style={{fontSize:10,color:C.muted}}>{entry.start} → {entry.end}{nights>0&&` · ${nights} night${nights!==1?"s":""}`}</span>
              {d.guestCount&&<span style={{fontSize:10,background:C.blue+"22",color:C.blue,padding:"2px 9px",borderRadius:8,fontWeight:700}}>👥 {d.guestCount} guests</span>}
              {d.occasion&&<span style={{fontSize:10,background:C.purple+"22",color:C.purple,padding:"2px 9px",borderRadius:8,fontWeight:700}}>🎉 {d.occasion}</span>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7,flexShrink:0}}>
            {/* Dept view badge */}
            <span style={{fontSize:10,background:`${meta.color}22`,color:meta.color,padding:"4px 10px",borderRadius:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,display:"flex",alignItems:"center",gap:5}}>
              {meta.IconC&&<Ico i={meta.IconC} s={11} c={meta.color}/>}<span>{meta.label}</span>
            </span>
          </div>
        </div>

        {/* Dept note */}
        {meta.note&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`,fontSize:11,color:C.muted,fontStyle:"italic"}}>{meta.note}</div>}
      </div>

      {/* Dept-specific content */}
      {renderView()}

      {/* Uploaded documents */}
      {entry.charterDetails?.uploadedDocs?.length>0&&canEdit&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <><Ico i={Paperclip} s={12} c={C.muted}/><span>Uploaded Documents</span></>
        </div>
        {entry.charterDetails.uploadedDocs.map(doc=>{
          const isImg = doc.type?.startsWith("image/");
          const isPdf = doc.type==="application/pdf"||doc.name?.toLowerCase().endsWith(".pdf");
          return <div key={doc.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:30,height:30,borderRadius:7,background:C.navyLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico i={isPdf?FileText:isImg?Image:File} s={15} c={C.muted}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
              <div style={{fontSize:9,color:C.muted}}>{doc.uploadedAt} · {doc.size>1024*1024?`${(doc.size/1024/1024).toFixed(1)} MB`:`${Math.round(doc.size/1024)} KB`}</div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {doc.aiExtracted&&<span style={{fontSize:9,background:C.green+"22",color:C.green,padding:"2px 7px",borderRadius:6,fontWeight:700}}>🤖 AI extracted</span>}
              {doc.published&&<span style={{fontSize:9,background:C.blue+"22",color:C.blue,padding:"2px 7px",borderRadius:6,fontWeight:700}}>Published</span>}
              <a href={doc.dataUrl} download={doc.name}
                style={{...btn,background:C.navy,color:C.white,border:`1px solid ${C.border}`,padding:"3px 10px",fontSize:10,textDecoration:"none",fontWeight:600}}>
                {"↓"}
              </a>
            </div>
          </div>;
        })}
        {onUpload&&<button onClick={onUpload} style={{...btn,width:"100%",background:"transparent",color:C.brass,border:`1px dashed ${C.brass}55`,padding:"7px 0",fontSize:11,marginTop:8}}>
          + Upload another document
        </button>}
      </div>}

      {/* Empty state */}
      {!entry.charterDetails&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:28,textAlign:"center",marginTop:8}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={30} c={C.muted}/></div>
        <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:6}}>No charter details added yet</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:14}}>
          {canEdit?"Add charter details manually or upload a preference sheet for AI extraction.":"Contact the Captain to add charter details."}
        </div>
        {canEdit&&<div style={{display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={onEdit} style={{...btn,background:C.brass,color:C.bg,padding:"8px 18px",fontWeight:700}}>+ Add Manually</button>
          {onUpload&&<button onClick={onUpload} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"8px 18px",fontWeight:600}}>Upload Document</button>}
        </div>}
      </div>}

    </div>
  </div>;
}

// ── UNIVERSAL ENTRY DETAIL POPUP ──────────────────────────────
// Shows relevant details for ANY calendar entry type.
// Single tap opens this for all types.
function EntryDetailPopup({entry, role, onClose, onEdit, onOpenCharter, onGoToLeave}) {
  const t = AVAIL_TYPES[entry.type]||AVAIL_TYPES.Unavailable;
  const canEdit = ["captain","management"].includes(role);
  const nights  = Math.max(0,Math.round((new Date(entry.end)-new Date(entry.start))/(1000*60*60*24)));
  // Swipe down to close
  const swipeStartY = React.useRef(0);
  const onSwipeStart = e => { swipeStartY.current = e.touches[0].clientY; };
  const onSwipeEnd   = e => { if(e.changedTouches[0].clientY - swipeStartY.current > 60) onClose(); };

  const Row = ({label,value})=>value?<div style={{display:"flex",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
    <div style={{fontSize:11,color:C.muted,minWidth:120,flexShrink:0}}>{label}</div>
    <div style={{fontSize:12,color:C.text,flex:1,lineHeight:1.5}}>{value}</div>
  </div>:null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",zIndex:700,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{width:"100%",background:C.card,borderRadius:"16px 16px 0 0",border:`1px solid ${t.color}44`,borderBottom:"none",padding:"20px 18px 40px",maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()}>

        {/* Handle bar — tall touch zone for reliable swipe, × button */}
        <div onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}
          style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,position:"relative",padding:"12px 0",cursor:"grab",touchAction:"none"}}>
          <div style={{width:44,height:5,background:C.muted+"88",borderRadius:3}}/>
          <button onClick={onClose} style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.muted,fontSize:24,cursor:"pointer",lineHeight:1,padding:"4px 8px"}}>{"×"}</button>
        </div>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:10,background:t.bg,border:`2px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico i={t.IconC||Calendar} s={22} c={t.color}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.navy,lineHeight:1.2,marginBottom:4}}>{entry.title}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:10,background:t.bg,color:t.color,border:`1px solid ${t.color}44`,padding:"2px 9px",borderRadius:8,fontWeight:700}}>{entry.type}</span>
              <span style={{fontSize:11,color:C.muted}}>{entry.start===entry.end?entry.start:`${entry.start} → ${entry.end}`}</span>
              {nights>0&&<span style={{fontSize:10,color:C.muted}}>{nights} night{nights!==1?"s":""}</span>}
            </div>
          </div>
        </div>

        {/* Type-specific content */}

        {/* BOOKED */}
        {entry.type==="Booked"&&<div>
          {entry.charterDetails?.guestCount&&<Row label="Guests" value={`${entry.charterDetails.guestCount} guests`}/>}
          {entry.charterDetails?.charterType&&<Row label="Charter type" value={entry.charterDetails.charterType}/>}
          {entry.charterDetails?.occasion&&<Row label="Occasion" value={entry.charterDetails.occasion}/>}
          {entry.charterDetails?.arrivalTime&&<Row label="Arrival" value={`${entry.charterDetails.arrivalTime}${entry.charterDetails.arrivalLocation?" · "+entry.charterDetails.arrivalLocation:""}`}/>}
          {entry.charterDetails?.departureTime&&<Row label="Departure" value={entry.charterDetails.departureTime}/>}
          {entry.charterDetails?.guestNotes&&<Row label="Guest notes" value={entry.charterDetails.guestNotes}/>}
          {entry.charterDetails?.vipGuests&&<div style={{background:C.amber+"18",border:`1px solid ${C.amber}44`,borderRadius:7,padding:"8px 11px",marginTop:8,fontSize:12,color:C.amber,fontWeight:600}}>{"VIP: "}{entry.charterDetails.vipGuests}</div>}
          {entry.charterDetails?.allergies&&entry.charterDetails.allergies!=="None declared."&&<div style={{background:C.signal+"18",border:`1px solid ${C.signal}44`,borderRadius:7,padding:"8px 11px",marginTop:8,fontSize:12,color:C.signal,fontWeight:700}}>{entry.charterDetails.allergies}</div>}
          <button onClick={onOpenCharter} style={{...btn,background:t.color,color:C.bg,width:"100%",padding:"11px 0",fontWeight:700,fontSize:13,marginTop:14}}>
            {"View Full Charter Details →"}
          </button>
        </div>}

        {/* OWNER USAGE */}
        {entry.type==="Owner Usage"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}`}/>
          {entry.startTime&&<Row label="Times" value={`${entry.startTime} → ${entry.endTime}`}/>}
          {entry.notes&&<Row label="Notes" value={entry.notes}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Owner usage — vessel is reserved for owner. Not available for charter."}
          </div>
        </div>}

        {/* MAINTENANCE BLOCK */}
        {entry.type==="Maintenance Block"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}${nights>0?` (${nights} days)`:""}`}/>
          {entry.startTime&&<Row label="Hours" value={`${entry.startTime} → ${entry.endTime}`}/>}
          {entry.notes&&<Row label="Details" value={entry.notes}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Vessel is in maintenance / dry dock. Not available for charter or use."}
          </div>
        </div>}

        {/* UNAVAILABLE */}
        {entry.type==="Unavailable"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}`}/>
          {entry.notes&&<Row label="Reason" value={entry.notes}/>}
          {!entry.notes&&<div style={{fontSize:12,color:C.muted,padding:"8px 0"}}>{"No specific reason recorded."}</div>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Vessel unavailable during this period."}
          </div>
        </div>}

        {/* HOLD */}
        {entry.type==="Hold"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}`}/>
          {entry.notes&&<Row label="Details" value={entry.notes}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"On Hold — awaiting payment or confirmation. Agents see this as Enquire Only."}
          </div>
        </div>}

        {/* ENQUIRE ONLY */}
        {entry.type==="Enquire Only"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}`}/>
          {entry.notes&&<Row label="Notes" value={entry.notes}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Enquire Only — agents must submit a request. Captain will confirm availability."}
          </div>
        </div>}

        {/* CREW CHANGE */}
        {entry.type==="Crew Change"&&<div>
          <Row label="Period" value={`${entry.start} → ${entry.end}`}/>
          {entry.startTime&&<Row label="Times" value={`${entry.startTime} → ${entry.endTime}`}/>}
          {entry.notes&&<Row label="Notes" value={entry.notes}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Crew rotation / change during this period."}
          </div>
        </div>}

        {/* CREW LEAVE — crew name always visible, no internal message */}
        {entry.type==="Crew Leave"&&<div>
          {entry.crewName&&<Row label="Crew member" value={entry.crewName}/>}
          {entry.leaveType&&<Row label="Leave type" value={entry.leaveType}/>}
          <Row label="Period" value={`${entry.start} → ${entry.end}${nights>0?` (${nights} days)`:""}`}/>
          {entry.notes&&<Row label="Notes" value={entry.notes}/>}
        </div>}

        {/* AVAILABLE */}
        {entry.type==="Available"&&<div>
          <Row label="Available from" value={entry.start}/>
          <Row label="Available until" value={entry.end}/>
          {entry.guestCapacity&&<Row label="Capacity" value={`${entry.guestCapacity} guests`}/>}
          {entry.charterTypes?.length>0&&<Row label="Charter types" value={entry.charterTypes.join(", ")}/>}
          {entry.minNights&&<Row label="Min nights" value={`${entry.minNights} nights`}/>}
          <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:t.color}}>
            {"Vessel is available for charter enquiries during this window."}
          </div>
        </div>}

        {/* Action buttons — role-based */}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`}}>{"Close"}</button>
          {/* Non-leave entries: Captain/Management can edit */}
          {entry.type!=="Crew Leave"&&canEdit&&
            <button onClick={onEdit} style={{...btn,flex:2,background:C.brass,color:C.bg,fontWeight:700}}>{"Edit Entry"}</button>}
          {/* Leave — Captain/Management: manage */}
          {entry.type==="Crew Leave"&&["captain","management"].includes(role)&&
            <button onClick={()=>{onClose();onGoToLeave&&onGoToLeave();}} style={{...btn,flex:2,background:C.brass,color:C.bg,fontWeight:700}}>{"Manage Leave →"}</button>}
          {/* Leave — own crew member: request alteration */}
          {entry.type==="Crew Leave"&&!["captain","management","owner"].includes(role)&&entry.crewRole===role&&
            <button onClick={()=>{onClose();onGoToLeave&&onGoToLeave();}} style={{...btn,flex:2,background:C.blue+"cc",color:"white",fontWeight:700}}>{"📝 Request Alteration →"}</button>}
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AGENT DASHBOARD — Yacht search & availability finder
// Internal operational data is never shown here.
// ═══════════════════════════════════════════════════════════════
// ── Booking Rules Panel — read-only for Agents ────────────────
function BookingRulesPanel({rules, profile, compact=false}) {
  if(!rules) return null;
  const items = [
    { icon:"⏱️", label:"Minimum notice",     value: rules.minNoticeHours>0 ? `${rules.minNoticeHours} hours before charter start` : "No minimum notice set", active: rules.minNoticeHours>0 },
    { icon:"🔄", label:"Turnaround time",    value: rules.turnaroundHours>0 ? `${rules.turnaroundHours} hours required between charters` : "No turnaround requirement", active: rules.turnaroundHours>0 },
    { icon:"🌙", label:"Minimum duration",   value: profile?.minCharterNights>0 ? `${profile.minCharterNights} night${profile.minCharterNights!==1?"s":""} minimum` : profile?.minNoticeDays>0 ? `${profile.minNoticeDays}-day minimum booking` : "No minimum duration set", active: !!(profile?.minCharterNights>0||profile?.minNoticeDays>0) },
    { icon:"🛡️", label:"Maintenance buffer", value: rules.maintBufferDays>0 ? `${rules.maintBufferDays} day${rules.maintBufferDays!==1?"s":""} buffer around maintenance blocks` : "No maintenance buffer", active: rules.maintBufferDays>0 },
    { icon:"⛔", label:"Blackout periods",   value: (rules.blackouts||[]).length>0 ? `${rules.blackouts.length} blackout period${rules.blackouts.length!==1?"s":""} — dates unavailable for booking` : "No blackout periods set", active: (rules.blackouts||[]).length>0 },
  ];
  return <div style={{background:`${C.amber}0d`,border:`1px solid ${C.amber}33`,borderRadius:10,padding: compact?"12px 14px":"16px 18px",marginBottom:14}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <Ico i={ClipboardList} s={14} c={C.muted}/>
      <div style={{fontSize:compact?11:12,fontWeight:800,color:C.amber,textTransform:"uppercase",letterSpacing:1}}>Yacht Booking Requirements</div>
      <div style={{fontSize:9,background:`${C.amber}22`,color:C.amber,padding:"1px 7px",borderRadius:8,fontWeight:700,marginLeft:"auto",whiteSpace:"nowrap"}}>Captain-Defined</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:compact?5:7}}>
      {items.map(({icon,label,value,active})=>(
        <div key={label} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"6px 9px",background: active?`${C.amber}12`:`${C.navyLight}88`,borderRadius:7,border:`1px solid ${active?C.amber+"33":C.border}`}}>
          <span style={{fontSize:13,flexShrink:0,marginTop:1}}>{icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>{label}</div>
            <div style={{fontSize:11,color:active?C.white:C.muted,fontWeight:active?600:400,marginTop:1}}>{value}</div>
          </div>
          {active&&<span style={{fontSize:9,background:`${C.amber}22`,color:C.amber,padding:"2px 6px",borderRadius:5,fontWeight:700,flexShrink:0,marginTop:2}}>ACTIVE</span>}
        </div>
      ))}
    </div>
    {(rules.blackouts||[]).length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.amber}22`}}>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Blackout dates</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {rules.blackouts.map(b=>(
          <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",background:`${C.signal}15`,border:`1px solid ${C.signal}33`,borderRadius:6}}>
            <Ico i={Ban} s={10} c={C.signal}/>
            <span style={{fontSize:11,color:C.signal,fontWeight:600}}>{b.start} → {b.end}</span>
            {b.label&&<span style={{fontSize:10,color:C.muted}}>· {b.label}</span>}
          </div>
        ))}
      </div>
    </div>}
    <div style={{marginTop:10,fontSize:10,color:C.muted,fontStyle:"italic",lineHeight:1.5}}>
      These requirements are set by the Captain and cannot be modified by agents. Enquiries that do not comply may be declined.
    </div>
  </div>;
}

// ── AGENT VESSEL CALENDAR — read-only calendar view for agents ──
// Shows availability only. Agent taps a date to pre-fill enquiry.
function AgentVesselCalendar({calView, onClose, onEnquire, C, btn, inp}) {
  const {vessel, p} = calView;
  const today = new Date().toISOString().slice(0,10);
  const [curDate, setCurDate] = useState(new Date());
  const swipeStartX = React.useRef(0);
  const swipeStartY = React.useRef(0);
  function prevMonth() { setCurDate(d=>{const n=new Date(d);n.setMonth(n.getMonth()-1);return n;}); }
  function nextMonth() { setCurDate(d=>{const n=new Date(d);n.setMonth(n.getMonth()+1);return n;}); }
  function onTouchStart(e) { swipeStartX.current=e.touches[0].clientX; swipeStartY.current=e.touches[0].clientY; }
  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY.current);
    if(Math.abs(dx)>50&&dy<60) { if(dx<0) nextMonth(); else prevMonth(); }
  }
  const curYear  = curDate.getFullYear();
  const curMonth = curDate.getMonth();
  const monthStr = `${curYear}-${String(curMonth+1).padStart(2,"0")}`;
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WDAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // Privacy-safe entries — collapse internal to Unavailable
  const INTERNAL = ["Booked","Owner Usage","Maintenance Block","Crew Change","Unavailable"];
  const safeEntries = (vessel.calEntries||[])
    .filter(e=>e.type!=="Crew Leave"&&e.type!=="Available")
    .map(e=>INTERNAL.includes(e.type)?{...e,type:"Unavailable",title:"Unavailable"}:e);

  function getEntries(dateStr) {
    return safeEntries.filter(e=>e.start<=dateStr&&e.end>=dateStr);
  }

  function cellColor(dateStr) {
    const entries = getEntries(dateStr);
    if(entries.some(e=>e.type==="Unavailable")) return {bg:C.signal+"22",border:C.signal+"44",label:"Unavailable",color:C.signal,canEnquire:false};
    if(entries.some(e=>["Hold","Enquire Only"].includes(e.type))) return {bg:C.amber+"22",border:C.amber+"44",label:"Enquire Only",color:C.amber,canEnquire:true};
    return {bg:`${C.green}15`,border:`${C.green}33`,label:"Available",color:C.greenL,canEnquire:true};
  }

  const daysInMonth = new Date(curYear, curMonth+1, 0).getDate();
  const firstDay    = new Date(curYear, curMonth, 1).getDay();
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) {
    const dateStr = `${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({d, dateStr});
  }

  return (
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:900,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:10,background:C.card,borderBottom:`1px solid ${C.border}`,padding:"13px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <button onClick={onClose} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"6px 12px",fontSize:12}}>{"← Back"}</button>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.navy}}>{p.yachtName}</div>
            <div style={{fontSize:11,color:C.muted}}>{p.operatingRegion} · Tap an available date to enquire</div>
          </div>
        </div>
        {/* Legend */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[["Available",C.greenL],["Enquire Only",C.amber],["Unavailable",C.signal]].map(([label,color])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:10,height:10,borderRadius:3,background:color+"44",border:`1px solid ${color}66`}}/>
              <span style={{fontSize:10,color:C.muted}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 14px"}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <button onClick={prevMonth}
            style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:15}}>{"‹"}</button>
          <div style={{fontSize:15,fontWeight:800,color:C.navy}}>{MONTHS[curMonth]} {curYear}</div>
          <button onClick={nextMonth}
            style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:15}}>{"›"}</button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
          {WDAYS.map(w=><div key={w} style={{fontSize:9,color:C.muted,textAlign:"center",padding:"3px 0",textTransform:"uppercase",letterSpacing:.6}}>{w}</div>)}
        </div>

        {/* Calendar grid — swipe left/right to change month */}
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,touchAction:"pan-y"}}>
          {cells.map((cell,i)=>{
            if(!cell) return <div key={"b"+i} style={{minHeight:52,background:C.navyMid,borderRadius:6,opacity:.2}}/>;
            const {d, dateStr} = cell;
            const isToday = dateStr===today;
            const isPast  = dateStr<today;
            const {bg,border,color,canEnquire} = cellColor(dateStr);
            return (
              <div key={dateStr}
                onClick={()=>!isPast&&canEnquire&&onEnquire(dateStr)}
                style={{minHeight:52,background:isPast?"#ffffff08":bg,border:`1px solid ${isPast?C.border:border}`,borderRadius:6,padding:"4px 5px",
                  cursor:isPast||!canEnquire?"default":"pointer",
                  outline:isToday?`2px solid ${C.brass}`:undefined,
                  opacity:isPast?.4:1,transition:"filter .1s"}}>
                <div style={{fontSize:11,fontWeight:isToday?800:400,color:isToday?C.brass:isPast?C.muted:color,lineHeight:1}}>{d}</div>
              </div>
            );
          })}
        </div>

        {/* Submit enquiry button */}
        <div style={{marginTop:20,padding:"14px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:11}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:10,lineHeight:1.5}}>
            Tap any <span style={{color:C.greenL,fontWeight:700}}>green</span> or <span style={{color:C.amber,fontWeight:700}}>amber</span> date to pre-fill your enquiry, or submit for any dates below.
          </div>
          <button onClick={()=>onEnquire(null)}
            style={{...btn,background:C.brass,color:C.bg,width:"100%",padding:"12px 0",fontWeight:800,fontSize:14}}>
            {"Submit Enquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesGateModal({rulesGate, onAccept, onCancel, btn, inp, C, BookingRulesPanel}) {
  const [localAck, setLocalAck] = useState(false);
  if(!rulesGate) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.95)",overflowY:"auto",WebkitOverflowScrolling:"touch",zIndex:850,padding:"16px"}}
      onClick={onCancel}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:"min(480px,100%)",padding:22,margin:"0 auto"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.navy,marginBottom:4}}>{rulesGate.p.yachtName}</div>
            <div style={{fontSize:11,color:C.muted}}>Review the booking requirements before proceeding</div>
          </div>
          <button onClick={onCancel} style={{background:"none",border:"none",color:C.muted,fontSize:24,cursor:"pointer",padding:"0 0 0 12px",lineHeight:1}}>{"×"}</button>
        </div>
        <BookingRulesPanel rules={rulesGate.vessel.rules} profile={rulesGate.p}/>
        <div onClick={()=>setLocalAck(p=>!p)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",marginBottom:14,background:localAck?`${C.green}18`:`${C.amber}0f`,border:`1px solid ${localAck?C.green+"44":C.amber+"44"}`,borderRadius:10,cursor:"pointer",userSelect:"none"}}>
          <div style={{flexShrink:0,width:22,height:22,borderRadius:5,background:localAck?C.green:C.navyLight,border:`2px solid ${localAck?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,transition:"all .15s"}}>
            {localAck&&<span style={{fontSize:13,color:"white",fontWeight:900,lineHeight:1}}>{"✓"}</span>}
          </div>
          <div style={{flex:1,fontSize:12,fontWeight:600,color:localAck?C.greenL:C.white,lineHeight:1.5}}>
            {"I understand and agree to the booking requirements for this vessel"}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"11px 0"}}>{"Cancel"}</button>
          <button disabled={!localAck} onClick={()=>{if(localAck){haptic("success");onAccept();}}}
            style={{...btn,flex:2,fontWeight:700,padding:"11px 0",background:localAck?C.brass:C.navyLight,color:localAck?C.bg:C.muted,border:`1px solid ${localAck?C.brass:C.border}`,opacity:localAck?1:.5,transition:"all .2s"}}>
            {"I Agree — View Calendar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentDashboard({vesselRegistry, enquiries, setEnquiries, role, showToast=()=>{}}) {
  const [search, setSearch] = useState({
    vesselName:"", location:"", startDate:"", endDate:"", guests:"", lengthMin:"", lengthMax:"", budgetMax:""
  });
  const [results,       setResults]       = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [calView,       setCalView]       = useState(null);   // {vessel,p} — vessel calendar view for agent
  const [enqOpen,       setEnqOpen]       = useState(false);
  const enqScrollRef = React.useRef(null);
  const [enqForm,       setEnqForm]       = useState({agentName:"",agentEmail:"",agentPhone:"",guests:"",charterType:"Day Charter",startDate:"",endDate:"",startTime:"",endTime:"",message:""});
  const [enqSent,       setEnqSent]       = useState(false);
  const [rulesAcked,    setRulesAcked]    = useState(false);
  const [rulesGate,     setRulesGate]     = useState(null);   // {vessel,p,availability} pending acceptance
  const [enqVessel,     setEnqVessel]     = useState(null);   // {vessel,p} context for enquiry modal

  function runSearch() {
    const res = [];
    for(const vessel of vesselRegistry) {
      const p = vessel.profile;
      if(!p.isActive||!p.agentVisible||!p.isCharterEnabled) continue;
      // Block vessels below profile completion threshold
      if(calcProfileScore(p, vessel.rules).pct < PROFILE_THRESHOLD) continue;
      // Vessel name filter
      if(search.vesselName) {
        if(!p.yachtName?.toLowerCase().includes(search.vesselName.toLowerCase())) continue;
      }
      // Location filter
      if(search.location) {
        const loc = (p.operatingRegion+" "+(p.additionalRegions||[]).join(" ")).toLowerCase();
        if(!loc.includes(search.location.toLowerCase())) continue;
      }
      // Guest capacity
      if(search.guests && Number(p.guestCapacity)<Number(search.guests)) continue;
      // Length
      if(search.lengthMin && Number(p.lengthM)<Number(search.lengthMin)) continue;
      if(search.lengthMax && Number(p.lengthM)>Number(search.lengthMax)) continue;
      // Budget
      if(search.budgetMax && p.dailyRate && Number(p.dailyRate)>Number(search.budgetMax)) continue;
      // Date availability — check no blocking entries overlap the range
      let availability = "Available";
      if(search.startDate) {
        const blocked = vessel.calEntries.filter(e=>{
          if(["Available","Crew Leave"].includes(e.type)) return false;
          return e.start<=search.endDate&&e.end>=search.startDate;
        });
        if(blocked.length>0) {
          const types = blocked.map(e=>e.type);
          if(types.some(t=>["Booked","Owner Usage","Maintenance Block","Unavailable"].includes(t)))
            availability="Unavailable";
          else if(types.some(t=>["Hold","Enquire Only"].includes(t)))
            availability="Request to Book";
        }
      }
      res.push({vessel, p, availability});
    }
    setResults(res);
    setSelected(null);
  }

  function submitEnquiry() {
    if(!enqForm.agentName||!enqForm.startDate||!enqForm.endDate) return;
    if(!rulesAcked) return;
    const enq = {
      id:          `enq_${Date.now()}`,
      vesselId:    enqVessel.vessel.id,
      vesselName:  enqVessel.p.yachtName,
      agentName:   enqForm.agentName,
      agentEmail:  enqForm.agentEmail,
      agentPhone:  enqForm.agentPhone,
      guests:      enqForm.guests||search.guests,
      charterType: enqForm.charterType,
      startDate:   enqForm.startDate||search.startDate,
      endDate:     enqForm.endDate||search.endDate,
      startTime:   enqForm.startTime||"",
      endTime:     enqForm.endTime||"",
      message:     enqForm.message,
      status:      "Pending",
      rulesAcknowledged: true,
      submittedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
    };
    setEnquiries(p=>[enq,...p]);
    setEnqSent(true);
    haptic("success");
    showToast("Enquiry sent to Captain","✓","success");
    setTimeout(()=>{ setEnqOpen(false); setEnqSent(false); setRulesAcked(false); setEnqVessel(null); setEnqForm({agentName:"",agentEmail:"",agentPhone:"",guests:"",charterType:"Day Charter",startDate:"",endDate:"",startTime:"",endTime:"",message:""}); }, 2000);
  }

  const availColor = a => a==="Available"?C.greenL:a==="Unavailable"?C.signal:C.amber;
  const availIcon  = a => a==="Available"?"✅":a==="Unavailable"?"🚫":"💬";

  const fi = {...inp, padding:"8px 11px", fontSize:12, width:"100%"};

  return <div>
    <div style={{marginBottom:18}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:4}}>{"Yacht Finder"}</div>
      <div style={{fontSize:12,color:C.muted}}>{"Search available yachts for charter"}</div>
    </div>

    {/* Search form */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 12px",marginBottom:12}}>
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Vessel Name"}</div>
          <input value={search.vesselName} onChange={e=>setSearch(p=>({...p,vesselName:e.target.value}))} placeholder="Search by name e.g. Tiberias…" style={fi}/>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Location"}</div>
          <input value={search.location} onChange={e=>setSearch(p=>({...p,location:e.target.value}))} placeholder="Dubai, UAE, Mediterranean…" style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"From"}</div>
          <input type="date" value={search.startDate} onChange={e=>setSearch(p=>({...p,startDate:e.target.value}))} style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"To"}</div>
          <input type="date" value={search.endDate} min={search.startDate} onChange={e=>setSearch(p=>({...p,endDate:e.target.value}))} style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Guests"}</div>
          <input type="number" min={1} value={search.guests} onChange={e=>setSearch(p=>({...p,guests:e.target.value}))} placeholder="e.g. 8" style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Max Budget (AED/day)"}</div>
          <input type="number" min={0} value={search.budgetMax} onChange={e=>setSearch(p=>({...p,budgetMax:e.target.value}))} placeholder="Optional" style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Min Length (m)"}</div>
          <input type="number" min={0} value={search.lengthMin} onChange={e=>setSearch(p=>({...p,lengthMin:e.target.value}))} placeholder="Optional" style={fi}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{"Max Length (m)"}</div>
          <input type="number" min={0} value={search.lengthMax} onChange={e=>setSearch(p=>({...p,lengthMax:e.target.value}))} placeholder="Optional" style={fi}/>
        </div>
      </div>
      <button onClick={runSearch} style={{...btn,background:C.brass,color:C.bg,width:"100%",padding:"11px 0",fontWeight:800,fontSize:14}}>
        {Object.values(search).every(v=>!v) ? "Search All Yachts" : "Search Yachts"}
      </button>
      <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:6}}>{"Leave fields blank to browse every available yacht"}</div>
    </div>

    {/* Results */}
    {results!==null&&<div>
      {/* General notice banner — shown whenever results are present */}
      <div style={{background:`${C.amber}0f`,border:`1px solid ${C.amber}33`,borderRadius:9,padding:"10px 14px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{flexShrink:0}}><Ico i={ClipboardList} s={14} c={C.brass}/></div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:2}}>Booking Requirements Apply</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>Each yacht has Captain-defined rules including minimum notice periods, turnaround times, and blackout dates. Expand a yacht below to view its specific requirements before submitting an enquiry.</div>
        </div>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>
        {results.length===0?"No yachts found matching your criteria.":`${results.length} yacht${results.length!==1?"s":""} found`}
      </div>
      {results.map(({vessel,p,availability})=>(
        <div key={vessel.id} onClick={()=>{
          if(selected?.vessel.id===vessel.id){setSelected(null);return;}
          setRulesGate({vessel,p,availability});
        }}
          style={{background:C.card,border:`1px solid ${selected?.vessel.id===vessel.id?C.brass:C.border}`,borderLeft:`3px solid ${availColor(availability)}`,borderRadius:10,padding:"14px 16px",marginBottom:9,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:C.navy,marginBottom:5}}>{p.yachtName}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:10,background:availColor(availability)+"22",color:availColor(availability),padding:"2px 9px",borderRadius:8,fontWeight:700}}>
                  {availIcon(availability)}{" "}{availability}
                </span>
                {p.guestCapacity&&<span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:"2px 9px",borderRadius:8}}>{p.guestCapacity}{" guests"}</span>}
                {p.lengthM&&<span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:"2px 9px",borderRadius:8}}>{p.lengthM}{"m"}</span>}
                {p.operatingRegion&&<span style={{fontSize:10,background:C.navyLight,color:C.muted,padding:"2px 9px",borderRadius:8}}>{p.operatingRegion}</span>}
                {vessel.rules?.minNoticeHours>0&&<span style={{fontSize:10,background:`${C.amber}22`,color:C.amber,padding:"2px 9px",borderRadius:8,fontWeight:600}}>{"⏱️ "}{vessel.rules.minNoticeHours}{"h notice required"}</span>}
                {vessel.rules?.turnaroundHours>0&&<span style={{fontSize:10,background:`${C.amber}18`,color:C.amber,padding:"2px 9px",borderRadius:8}}>{"🔄 "}{vessel.rules.turnaroundHours}{"h turnaround"}</span>}
                {(vessel.rules?.blackouts||[]).length>0&&<span style={{fontSize:10,background:`${C.signal}18`,color:C.signal,padding:"2px 9px",borderRadius:8}}>{"⛔ "}{vessel.rules.blackouts.length}{" blackout"}{vessel.rules.blackouts.length!==1?"s":""}</span>}
              </div>
            </div>
            {p.showPricingToAgent&&p.dailyRate&&<div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:800,color:C.brass}}>{p.currency||"AED"}{" "}{Number(p.dailyRate).toLocaleString()}</div>
              <div style={{fontSize:9,color:C.muted}}>{"per day"}</div>
            </div>}
          </div>

          {/* Expanded profile */}
          {selected?.vessel.id===vessel.id&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px",marginBottom:12}}>
              {[[" Vessel class",p.vesselClass],[" Type",p.yachtType],[" Length",p.lengthM?p.lengthM+"m":"—"],["Day guests",p.guestCapacity||"—"],["Overnight",p.overnightCapacity||"—"],["Home marina",p.homeMarina||"—"]].map(([k,v])=>v&&v!=="—"?
                <div key={k}>
                  <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{k}</div>
                  <div style={{fontSize:12,color:C.text,fontWeight:600}}>{v}</div>
                </div>:null
              )}
            </div>
            {p.charterTypes?.length>0&&<div style={{marginBottom:10}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>{"Charter types"}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {p.charterTypes.map(t=><span key={t} style={{fontSize:10,background:C.brass+"22",color:C.brass,padding:"2px 9px",borderRadius:8}}>{t}</span>)}
              </div>
            </div>}
            {p.amenities?.length>0&&<div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>{"Amenities"}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {p.amenities.map(a=><span key={a} style={{fontSize:10,background:C.navyLight,color:C.text,padding:"2px 9px",borderRadius:8}}>{a}</span>)}
              </div>
            </div>}
            {availability!=="Unavailable"&&<button onClick={e=>{e.stopPropagation();setEnqOpen(true);setEnqForm(p=>({...p,startDate:search.startDate,endDate:search.endDate,guests:search.guests}));setTimeout(()=>{if(enqScrollRef.current){enqScrollRef.current.scrollTop=0;}},30);}}
              style={{...btn,background:C.brass,color:C.bg,width:"100%",padding:"10px 0",fontWeight:700,fontSize:13}}>
              {"Submit Enquiry →"}
            </button>}
            {availability==="Unavailable"&&<div style={{background:C.signal+"15",border:`1px solid ${C.signal}33`,borderRadius:7,padding:"9px 12px",fontSize:12,color:C.signal,textAlign:"center"}}>
              {"Not available for the selected dates"}
            </div>}
          </div>}
        </div>
      ))}
    </div>}

    {/* ── VESSEL RULES GATE ── */}
    <RulesGateModal
      rulesGate={rulesGate}
      onAccept={()=>{setCalView({vessel:rulesGate.vessel,p:rulesGate.p});setRulesGate(null);}}
      onCancel={()=>setRulesGate(null)}
      btn={btn} inp={inp} C={C} BookingRulesPanel={BookingRulesPanel}
    />

    {/* ── AGENT VESSEL CALENDAR VIEW ── */}
    {calView&&<AgentVesselCalendar
      calView={calView}
      onClose={()=>setCalView(null)}
      onEnquire={dateStr=>{
        setEnqVessel({vessel:calView.vessel,p:calView.p});
        setEnqForm(p=>({...p,startDate:dateStr||"",endDate:dateStr||"",guests:search.guests}));
        setCalView(null);
        setEnqOpen(true);
        setTimeout(()=>{if(enqScrollRef.current)enqScrollRef.current.scrollTop=0;},30);
      }}
      C={C} btn={btn} inp={inp}
    />}

    {/* ── AGENT ENQUIRY MODAL ── */}
    {enqOpen&&enqVessel&&<div ref={enqScrollRef}
      style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(7,16,31,.92)",overflowY:"auto",WebkitOverflowScrolling:"touch",zIndex:800,padding:"16px"}}
      onClick={()=>setEnqOpen(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:"min(480px,100%)",padding:22,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>

        {enqSent
          ? <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={CheckCircle} s={48} c={C.greenL}/></div>
              <div style={{fontSize:16,fontWeight:800,color:C.navy,marginBottom:6}}>{"Enquiry Sent!"}</div>
              <div style={{fontSize:12,color:C.muted}}>{"The Captain will respond shortly."}</div>
            </div>
          : <>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:7}}><Ico i={Mail} s={16} c={C.navy}/>{"Charter Enquiry"}</div>
                  <div style={{fontSize:11,color:C.brass,marginTop:2}}>{enqVessel.p.yachtName}{" · "}{enqVessel.p.operatingRegion}</div>
                </div>
                <button onClick={()=>{setEnqOpen(false);setRulesAcked(false);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:24,padding:0,lineHeight:1}} onClick={()=>{setEnqOpen(false);setEnqVessel(null);}}>{"×"}</button>
              </div>

              {/* Booking rules accepted at vessel level — not repeated here */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",marginBottom:14,background:`${C.green}12`,border:`1px solid ${C.green}33`,borderRadius:8}}>
                <span style={{fontSize:13,color:C.greenL}}>{"✓"}</span>
                <span style={{fontSize:11,color:C.greenL,fontWeight:600}}>{"Booking requirements accepted"}</span>
              </div>

              {/* Fields */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

                <div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Your Name *"}</div>
                  <input type="text" value={enqForm.agentName} onChange={e=>setEnqForm(p=>({...p,agentName:e.target.value}))} placeholder="Full name" style={{...inp,width:"100%",padding:"9px 12px",fontSize:13}}/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Email"}</div>
                    <input type="email" value={enqForm.agentEmail} onChange={e=>setEnqForm(p=>({...p,agentEmail:e.target.value}))} placeholder="you@email.com" style={{...inp,width:"100%",padding:"9px 10px",fontSize:12}}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Phone"}</div>
                    <input type="tel" value={enqForm.agentPhone} onChange={e=>setEnqForm(p=>({...p,agentPhone:e.target.value}))} placeholder="+971…" style={{...inp,width:"100%",padding:"9px 10px",fontSize:12}}/>
                  </div>
                </div>

                <div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Guests"}</div>
                  <input type="number" min={1} value={enqForm.guests} onChange={e=>setEnqForm(p=>({...p,guests:e.target.value}))} placeholder="e.g. 8" style={{...inp,width:"100%",padding:"9px 12px",fontSize:13}}/>
                </div>

                <div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Charter Type *"}</div>
                  <select value={enqForm.charterType} onChange={e=>setEnqForm(p=>({...p,charterType:e.target.value,startTime:"",endTime:""}))} style={{...inp,width:"100%",padding:"9px 12px",fontSize:13}}>
                    {["Half Day (Morning)","Half Day (Afternoon)","Day Charter","Sunset Cruise","Overnight Charter","Weekend Charter","Weekly Charter","Corporate Event","Private Party","Other"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Start Date *"}</div>
                    <input type="date" value={enqForm.startDate}
                      onChange={e=>{const d=e.target.value;setEnqForm(p=>({...p,startDate:d,endDate:["Half Day (Morning)","Half Day (Afternoon)","Day Charter","Sunset Cruise"].includes(p.charterType)?d:(!p.endDate||p.endDate<d)?d:p.endDate}));}}
                      style={{...inp,width:"100%",padding:"9px 8px",fontSize:12}}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"End Date"}</div>
                    <input type="date" value={enqForm.endDate} min={enqForm.startDate} onChange={e=>setEnqForm(p=>({...p,endDate:e.target.value}))} style={{...inp,width:"100%",padding:"9px 8px",fontSize:12}}/>
                  </div>
                </div>

                {["Half Day (Morning)","Half Day (Afternoon)","Day Charter","Sunset Cruise"].includes(enqForm.charterType)&&<div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{"Charter Times"}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{"From"}</div>
                      <input type="time" value={enqForm.startTime} onChange={e=>setEnqForm(p=>({...p,startTime:e.target.value}))} style={{...inp,width:"100%",padding:"9px 8px",fontSize:13}}/>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{"To"}</div>
                      <input type="time" value={enqForm.endTime} onChange={e=>setEnqForm(p=>({...p,endTime:e.target.value}))} style={{...inp,width:"100%",padding:"9px 8px",fontSize:13}}/>
                    </div>
                  </div>
                  {enqForm.startTime&&enqForm.endTime&&(()=>{
                    const[sh,sm]=enqForm.startTime.split(":").map(Number);
                    const[eh,em]=enqForm.endTime.split(":").map(Number);
                    const hrs=(eh*60+em-sh*60-sm)/60;
                    return hrs>0?<div style={{marginTop:6,fontSize:12,color:C.brass,fontWeight:600}}>{enqForm.startTime}{" → "}{enqForm.endTime}{" · "}{hrs%1===0?hrs:hrs.toFixed(1)}{" hours"}</div>:null;
                  })()}
                </div>}

                <div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{"Message (optional)"}</div>
                  <textarea value={enqForm.message} onChange={e=>setEnqForm(p=>({...p,message:e.target.value}))} rows={3} placeholder="Special requirements, occasion, questions…" style={{...inp,width:"100%",padding:"9px 12px",fontSize:12,resize:"vertical",lineHeight:1.5}}/>
                </div>

                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setEnqOpen(false)} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"11px 0"}}>{"Cancel"}</button>
                  <button onClick={()=>{haptic("success");submitEnquiry();}} disabled={!enqForm.agentName||!enqForm.startDate}
                    style={{...btn,flex:2,fontWeight:700,padding:"11px 0",
                      background:enqForm.agentName&&enqForm.startDate?C.brass:C.navyLight,
                      color:enqForm.agentName&&enqForm.startDate?C.bg:C.muted,
                      border:`1px solid ${enqForm.agentName&&enqForm.startDate?C.brass:C.border}`,
                      opacity:enqForm.agentName&&enqForm.startDate?1:.5,transition:"all .2s"}}>
                    {"Send Enquiry →"}
                  </button>
                </div>

              </div>
            </>
        }
      </div>
    </div>}
  </div>;
}

// ── TOAST NOTIFICATION SYSTEM ────────────────────────────────
function ToastContainer({toasts}) {
  if(!toasts.length) return null;
  return <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,alignItems:"center",pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} style={{
        background:t.type==="error"?C.signal:t.type==="warning"?C.amber:C.greenL,
        color:"#0a1628",
        padding:"10px 20px",borderRadius:24,fontSize:13,fontWeight:700,
        boxShadow:"0 4px 20px rgba(0,0,0,.4)",
        display:"flex",alignItems:"center",gap:8,
        animation:"toastIn .25s ease",
        whiteSpace:"nowrap",maxWidth:"90vw",overflow:"hidden",textOverflow:"ellipsis"
      }}>
        <span>{t.message}</span>
      </div>
    ))}
  </div>;
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = React.useCallback((message, icon="✓", type="success", duration=2500) => {
    const id = Date.now();
    setToasts(p=>[...p,{id,message,icon,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), duration);
  },[]);
  return {toasts, show};
}

function VesselProfileField({label, required, children, C}) {
  return <div style={{marginBottom:13}}>
    <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>
      {label}{required&&<span style={{color:"#e05a5a",marginLeft:3}}>*</span>}
    </div>
    {children}
  </div>;
}

function ProfileScorePanel({pct, missing, missingCritical, agentReady, col, C, PROFILE_THRESHOLD}) {
  return <div style={{background:C.card,border:`1px solid ${col}44`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:C.navy}}>Profile Completeness</div>
        <div style={{fontSize:10,color:agentReady?C.greenL:C.signal,fontWeight:600,marginTop:2}}>
          {pct===100?"Fully optimised":agentReady?"Agent-ready — keep optimising":`Below ${PROFILE_THRESHOLD}% — hidden from agents`}
        </div>
      </div>
      <div style={{fontSize:20,fontWeight:900,color:col}}>{pct}%</div>
    </div>
    <div style={{background:C.navyLight,borderRadius:4,height:7,overflow:"hidden",marginBottom:10}}>
      <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:4,transition:"width .4s"}}/>
    </div>
    <div style={{position:"relative",height:6,marginBottom:8}}>
      <div style={{position:"absolute",left:`${PROFILE_THRESHOLD}%`,top:0,transform:"translateX(-50%)",fontSize:8,color:C.muted,whiteSpace:"nowrap"}}>{PROFILE_THRESHOLD}% threshold</div>
    </div>
    {missing.length>0&&<div>
      {missingCritical.length>0&&<div style={{marginBottom:6}}>
        <div style={{fontSize:10,color:C.signal,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Required to show to agents</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {missingCritical.map(f=><span key={f.key} style={{fontSize:10,background:`${C.signal}18`,color:C.signal,border:`1px solid ${C.signal}33`,padding:"2px 8px",borderRadius:5}}>⚠ {f.label}</span>)}
        </div>
      </div>}
      {missing.filter(f=>!f.critical).length>0&&<div>
        <div style={{fontSize:10,color:C.amber,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Recommended</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {missing.filter(f=>!f.critical).map(f=><span key={f.key} style={{fontSize:10,background:`${C.amber}12`,color:C.amber,border:`1px solid ${C.amber}33`,padding:"2px 8px",borderRadius:5}}>{f.label}</span>)}
        </div>
      </div>}
    </div>}
  </div>;
}

function CalendarModule({calEntries, setCalEntries, role, logAudit, enquiries=[], setEnquiries=()=>{}, notifications=[], setNotifications=()=>{}, vesselRegistry=[], setVesselRegistry=()=>{}, leaveRequests=[], tasks=[], setTasks=()=>{}, setView=()=>{}, initCalView=null, clearInitCalView=()=>{}, showToast=()=>{}}) {
  const logC = (a,d) => logAudit&&logAudit(a,d,"Calendar");
  const canEdit = ["captain","management"].includes(role);
  const isAgent = role === "agent";
  const isMobile = window.innerWidth < 768;
  // Active vessel — first in registry (single vessel for now, multi-vessel uses switcher)
  const activeVessel = vesselRegistry[0] || null;
  // Sync profileForm when activeVessel changes
  React.useEffect(()=>{
    if(activeVessel?.profile) {
      setProfile(p=>({...DEFAULT_YACHT_PROFILE,...activeVessel.profile}));
      setProfileForm(p=>({...DEFAULT_YACHT_PROFILE,...activeVessel.profile}));
      setProfileDirty(false);
    }
  },[activeVessel?.id]);

  // Universal detail popup state - all entry types
  const [detailEntry, setDetailEntry] = useState(null);
  const [multiDetail, setMultiDetail]   = useState(null); // array of entries when date has multiple

  // ── Merge approved leave into calendar view ───────────────
  // Approved leave requests appear as "Crew Leave" blocks on the calendar.
  // Internal only — agents see them as Unavailable with no crew detail.
  // Captain/Management see the crew member name and leave type.
  // Read-only — editing is done via the Leave module, not calendar.
  const leaveCalEntries = (leaveRequests||[])
    .filter(r => r.status === "approved")
    .map(r => {
      const lt = LEAVE_TYPES ? LEAVE_TYPES.find(t => t.id === r.type) : null;
      return {
        id:        "leave_" + r.id,
        type:      "Crew Leave",
        title:     (r.crewName||"Crew") + " — " + (lt ? lt.label : r.type),
        start:     r.start,
        end:       r.end,
        startTime: "00:00",
        endTime:   "23:59",
        notes:     r.notes||"",
        crewName:  r.crewName||"",
        crewRole:  r.crewRole||"",
        leaveType: lt ? lt.label : r.type,
        createdBy: "leave-system",
        readOnly:  true,
        leaveRef:  r.id,
      };
    });

  // Combined entries: calendar entries + approved leave blocks
  const allCalEntries = [...calEntries, ...leaveCalEntries];
  const [charterDetailEntry, setCharterDetailEntry] = useState(null);
  const [showDocUploader,    setShowDocUploader]    = useState(false);
  const [docUploaderEntry,   setDocUploaderEntry]   = useState(null);
  // Inline pref sheet upload during NEW entry creation
  const [showInlineUploader, setShowInlineUploader] = useState(false);
  const [inlineUploading,    setInlineUploading]    = useState(false);
  const [inlineUploadError,  setInlineUploadError]  = useState(null);
  const inlineFileRef = useRef(null);

  async function runInlineExtraction(file) {
    if(!file) return;
    const ACCEPTED_EXT = [".pdf",".doc",".docx",".txt"];
    const okExt = ACCEPTED_EXT.some(e=>file.name.toLowerCase().endsWith(e));
    if(!okExt) { setInlineUploadError("Please upload a PDF, Word (.docx) or text file."); return; }
    if(file.size > 10*1024*1024) { setInlineUploadError("File must be under 10 MB."); return; }
    setInlineUploading(true); setInlineUploadError(null);
    const reader = new FileReader();
    reader.onload = async e => {
      const dataUrl = e.target.result;
      const isPdf = file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.name.toLowerCase().endsWith(".docx")||file.name.toLowerCase().endsWith(".doc");
      const systemPrompt = `You are a yacht charter operations assistant. Extract guest preference and operational information from the uploaded document and return ONLY a valid JSON object (no markdown, no commentary) with exactly these keys: {"charterType":"","guestCount":"","guestNotes":"","occasion":"","arrivalFrom":"","arrivalTime":"","arrivalLocation":"","arrivalNotes":"","departureTime":"","departureLocation":"","departureNotes":"","vipGuests":"","specialRequests":"","cabinAssignments":"","cabinPreferences":"","drinkPreferences":"","winePreferences":"","softDrinkPrefs":"","allergies":"","dietaryReqs":"","mealPreferences":"","mealRequests":"","guestFoodPrefs":"","watersportsReqs":"","jetSkiReqs":"","seabobReqs":"","efoilReqs":"","tenderOps":"","beachSetupReqs":"","fuelRequired":"","engineNotes":"","captainNotes":""}. Leave a field empty string if not found.`;
      try {
        const msgContent = isPdf
          ? [{type:"document",source:{type:"base64",media_type:"application/pdf",data:dataUrl.split(",")[1]}},{type:"text",text:"Extract all charter preference data from this document and return as JSON."}]
          : [{type:"text",text:`Extract charter data from this ${isDocx?"Word":"text"} document and return as JSON.

Content (base64): ${dataUrl.split(",")[1].slice(0,8000)}`}];
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:systemPrompt,messages:[{role:"user",content:msgContent}]})
        });
        const data = await res.json();
        const text = (data.content||[]).map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(text);
        setForm(p=>({...p,charterDetails:{...(p.charterDetails||{}), ...parsed}}));
        setShowInlineUploader(false);
        logC("Preference Sheet Uploaded (inline)", file.name);
      } catch(err) {
        setInlineUploadError("AI extraction failed — fill in manually or try again.");
      }
      setInlineUploading(false);
    };
    reader.readAsDataURL(file);
  }

  // ══════════════════════════════════════════════════════════════
  // EXTERNAL PRIVACY LAYER — STRICT
  // ══════════════════════════════════════════════════════════════
  // Hard requirement: agents and external viewers NEVER see any
  // internal operational detail. The only permitted external
  // statuses are: Available | Unavailable | Request to Book.
  //
  // Internal statuses that map to "Unavailable" externally:
  //   Booked          → Unavailable  (hides who, when, how many)
  //   Owner Usage     → Unavailable  (hides owner schedule)
  //   Maintenance Block → Unavailable (hides operational state)
  //   Crew Change     → Unavailable  (hides staffing detail)
  //   Unavailable     → Unavailable  (kept, reason hidden)
  //
  // "Available" is the only status that passes through — but ALL
  // internal fields (notes, guestCapacity per-entry, charterTypes,
  // priceOverride, startTime, endTime, createdBy) are stripped.
  // ══════════════════════════════════════════════════════════════

  // The only types the external layer is permitted to produce
  const EXT_TYPE_AVAILABLE   = "Available";
  const EXT_TYPE_UNAVAILABLE = "Unavailable";
  // "Request to Book" is a UI action state, not a calendar entry type

  // Every internal type that must collapse to Unavailable externally
  const INTERNAL_TYPES = ["Booked","Owner Usage","Maintenance Block","Crew Change","Unavailable"];
  // Types that collapse to "Enquire Only" externally — not blocked, but requires request
  const ENQUIRE_TYPES  = ["Hold","Enquire Only"];

  // The single source-of-truth masking function.
  function applyPrivacyLayer(entry) {
    // Hard block — collapses to Unavailable with zero detail
    if(INTERNAL_TYPES.includes(entry.type)) {
      return {
        id:            entry.id,
        type:          EXT_TYPE_UNAVAILABLE,
        title:         EXT_TYPE_UNAVAILABLE,
        start:         entry.start,
        end:           entry.end,
        startTime:     null, endTime:       null,
        notes:         null, guestCapacity: null,
        charterTypes:  null, minNights:     null,
        maxNights:     null, priceOverride: null,
        createdBy:     null,
      };
    }

    // Hold / Enquire Only — agent sees "Enquire Only" with CTA, no internal detail
    if(ENQUIRE_TYPES.includes(entry.type)) {
      return {
        id:            entry.id,
        type:          "Enquire Only",
        title:         "Enquire Only",
        start:         entry.start,
        end:           entry.end,
        // These pass through to help agent form an enquiry
        guestCapacity: entry.guestCapacity||null,
        charterTypes:  entry.charterTypes||null,
        minNights:     entry.minNights||null,
        maxNights:     entry.maxNights||null,
        // Everything internal stripped
        startTime:     null, endTime:       null,
        notes:         null, priceOverride: null,
        createdBy:     null,
      };
    }

    // Available — passes through with booking-relevant fields only
    return {
      id:            entry.id,
      type:          EXT_TYPE_AVAILABLE,
      title:         EXT_TYPE_AVAILABLE,
      start:         entry.start,
      end:           entry.end,
      guestCapacity: entry.guestCapacity||null,
      charterTypes:  entry.charterTypes||null,
      minNights:     entry.minNights||null,
      maxNights:     entry.maxNights||null,
      startTime:     null, endTime:       null,
      notes:         null, priceOverride: null,
      createdBy:     null,
    };
  }

  // Privacy-safe entry list — only computed when role is agent
  // Internal users always get raw calEntries with no transformation
  const externalEntries = isAgent ? allCalEntries.filter(e=>e.type!=="Crew Leave").map(applyPrivacyLayer) : allCalEntries;

  // Privacy-safe vessel registry — used by queryAvailability for agent searches.
  // Strips all internal data from every vessel before it can be queried externally.
  function applyRegistryPrivacyLayer(registry) {
    return registry.map(vessel => ({
      ...vessel,
      calEntries: vessel.calEntries.map(applyPrivacyLayer),
      // Expose booking-relevant rules only — agents must see these
      rules: vessel.rules ? {
        minNoticeHours:  vessel.rules.minNoticeHours,
        turnaroundHours: vessel.rules.turnaroundHours,
        maintBufferDays: vessel.rules.maintBufferDays,
        blackouts:       vessel.rules.blackouts || [],
      } : null,
      // Strip enquiries from other agents
      enquiries:  [],
    }));
  }

  // The safe registry agents can query — raw registry for internal users
  const queryableRegistry = isAgent
    ? applyRegistryPrivacyLayer(vesselRegistry)
    : vesselRegistry;

  // ── State ────────────────────────────────────────────────────
  const [viewMode, setViewMode]     = useState(()=>{ const v=initCalView; if(v){clearInitCalView();return v;} return "month"; });
  const [curYear,  setCurYear]      = useState(new Date().getFullYear());
  const [curMonth, setCurMonth]     = useState(new Date().getMonth());
  const [typeFilter,setTypeFilter]  = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [editEntry,setEditEntry]    = useState(null);
  const [selected, setSelected]     = useState(null);
  const [clickDate,setClickDate]    = useState(null);
  const [form, setForm]             = useState({
    type:"Available", title:"", start:TODAY, end:TODAY,
    startTime:"08:00", endTime:"18:00", notes:"",
    charterDetails: null,
  });

  // ── Rules state ──────────────────────────────────────────────
  const [rules, setRules]           = useState(DEFAULT_CAL_RULES);
  const [rulesForm, setRulesForm]   = useState(DEFAULT_CAL_RULES);
  const [rulesDirty, setRulesDirty] = useState(false);
  const [blackoutForm, setBlackoutForm] = useState({start:TODAY,end:TODAY,label:""});
  const [ownerForm, setOwnerForm]   = useState({start:TODAY,end:TODAY,label:""});

  // ── Yacht profile state ──────────────────────────────────────
  const [profile, setProfile]       = useState(()=>({...DEFAULT_YACHT_PROFILE,...(activeVessel?.profile||{})}));
  const [profileForm, setProfileForm] = useState(()=>({...DEFAULT_YACHT_PROFILE,...(activeVessel?.profile||{})}));
  const [profileDirty, setProfileDirty] = useState(false);

  function saveProfile() {
    setVesselRegistry(reg=>reg.map(v=>v.id===activeVessel.id?{...v,profile:{...v.profile,...profileForm},rules:{...rulesForm},updatedAt:new Date().toISOString()}:v));
    setProfileDirty(false);
    setRulesDirty(false);
    logAudit("Vessel Profile & Rules Saved",`${profileForm.yachtName||"Vessel"} — profile and charter rules updated`,"Calendar");
  }
  function updateProfile(patch) {
    setProfileForm(p=>({...p,...patch}));
    setProfileDirty(true);
  }

  // ── Enquiry state (agent submits, captain responds) ──────────
  const [showEnqForm,  setShowEnqForm]  = useState(false);
  const [showInbox,    setShowInbox]    = useState(false);
  const [moreInfoId,   setMoreInfoId]   = useState(null);  // enquiry id awaiting more info reply
  const [moreInfoText, setMoreInfoText] = useState("");
  const [enqForm, setEnqForm] = useState({
    startDate: TODAY, endDate: TODAY,
    guests: 2, charterType: "Day Charter",
    agentName: "", agentEmail: "", agentPhone: "",
    notes: "",
  });

  const CHARTER_TYPES = ["Day Charter","Overnight Charter","Weekend Charter","Weekly Charter","Corporate Event","Private Party","Other"];
  const pendingEnquiries = enquiries.filter(e=>e.status==="Pending");

  // ── Agent multi-vessel panel state ───────────────────────────
  const [showVesselPanel, setShowVesselPanel] = useState(false);
  const [vesselFormMode,  setVesselFormMode]  = useState("list"); // list | add | view
  const [selectedVesselId, setSelectedVesselId] = useState(null);
  const [newVesselForm, setNewVesselForm]     = useState({
    yachtName:"", yachtType:"Mixed Use", vesselClass:"Motor Yacht",
    lengthM:"", guestCapacity:"", overnightCapacity:"",
    homeMarina:"", operatingRegion:"Dubai, UAE", additionalRegions:[],
    charterTypes:["Day Charter"], amenities:[],
    minCharterNights:1, currency:"AED", dailyRate:"", hourlyRate:"",
  });

  function addVesselToRegistry() {
    if(!newVesselForm.yachtName.trim()) return;
    const id = makeVesselId();
    const record = {
      id,
      profile: {
        ...DEFAULT_YACHT_PROFILE,
        ...newVesselForm,
        vesselId:      id,
        registeredAt:  new Date().toISOString(),
        isActive:      true,
      },
      calEntries:  [],
      rules:       DEFAULT_CAL_RULES,
      enquiries:   [],
      agentAccess: ["all"],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };
    setVesselRegistry(p=>[...p, record]);
    logC("Vessel Added to Registry", `${newVesselForm.yachtName} (${newVesselForm.operatingRegion})`);
    // Auto-create profile completion task for Captain
    const profileTask = {
      id:          `task_profile_${id}`,
      title:       `Complete vessel profile — ${newVesselForm.yachtName||"New Vessel"}`,
      notes:       "Fill in all required fields in the Vessel tab of the Calendar to make this vessel visible to agents and enable bookings. Task auto-closes at 100% completion.",
      assignedTo:  "captain",
      approvedBy:  "captain",
      dept:        "Captain",
      priority:    "High",
      recurrence:  "One-off",
      category:    "Admin",
      status:      "Pending",
      dueDate:     new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,10),
      createdAt:   new Date().toISOString(),
      vesselId:    id,
      isProfileTask: true,
    };
    setTasks(p=>[profileTask,...p]);
    setVesselFormMode("list");
    setNewVesselForm({yachtName:"",yachtType:"Mixed Use",vesselClass:"Motor Yacht",lengthM:"",guestCapacity:"",overnightCapacity:"",homeMarina:"",operatingRegion:"Dubai, UAE",additionalRegions:[],charterTypes:["Day Charter"],amenities:[],minCharterNights:1,currency:"AED",dailyRate:"",hourlyRate:""});
  }

  function removeVesselFromRegistry(id) {
    if(id==="vsl_tiberius") { alert("The active vessel cannot be removed from the registry."); return; }
    setVesselRegistry(p=>p.filter(v=>v.id!==id));
    logC("Vessel Removed from Registry", id);
  }

  function toggleVesselActive(id) {
    setVesselRegistry(p=>p.map(v=>v.id===id?{...v,profile:{...v.profile,isActive:!v.profile.isActive},updatedAt:new Date().toISOString()}:v));
  }

  function pushNotification(msg, type="enquiry") {
    const n = {id:`n_${Date.now()}`, msg, type, ts:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}), read:false};
    setNotifications(p=>[n,...p]);
  }

  function submitEnquiry() {
    if(!enqForm.startDate||!enqForm.guests||!enqForm.agentName) return;
    const enq = {
      ...enqForm,
      id:       `enq_${Date.now()}`,
      status:   "Pending",           // Pending | Accepted | Declined | More Info
      submittedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      captainResponse: null,
      moreInfoThread:  [],
    };
    setEnquiries(p=>[enq,...p]);
    pushNotification(`New enquiry from ${enqForm.agentName}: ${enqForm.startDate}→${enqForm.endDate}, ${enqForm.guests} guests (${enqForm.charterType})`);
    logC("Enquiry Submitted", `${enqForm.agentName} · ${enqForm.startDate}→${enqForm.endDate} · ${enqForm.guests} guests`);
    setShowEnqForm(false);
    setEnqForm({startDate:TODAY,endDate:TODAY,guests:2,charterType:"Day Charter",agentName:"",agentEmail:"",agentPhone:"",notes:""});
    alert("Enquiry submitted. The Captain will respond shortly.");
  }

  function respondEnquiry(id, decision, message) {
    const enq = enquiries.find(e=>e.id===id);
    if(!enq) return;
    setEnquiries(p=>p.map(e=>e.id===id?{...e,
      status:decision,
      captainResponse: message||"",
      respondedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
    }:e));
    // Email notification — opens default mail client
    if(enq.agentEmail) {
      const subj = encodeURIComponent(`Charter Enquiry ${decision} — ${enq.startDate} to ${enq.endDate}`);
      const body = encodeURIComponent(
        `Dear ${enq.agentName},\n\nThank you for your enquiry.\n\n`+
        `Dates: ${enq.startDate} → ${enq.endDate}\nGuests: ${enq.guests}\nCharter type: ${enq.charterType}\n\n`+
        `Status: ${decision}\n\n${message||""}\n\nKind regards,\nCaptain — Bridge Yacht Operations`
      );
      window.open(`mailto:${enq.agentEmail}?subject=${subj}&body=${body}`);
    }
    logC(`Enquiry ${decision}`, `${enq.agentName} · ${enq.startDate}→${enq.endDate}`);
    setMoreInfoId(null); setMoreInfoText("");
  }

  function sendMoreInfo(id) {
    if(!moreInfoText.trim()) return;
    const enq = enquiries.find(e=>e.id===id);
    if(!enq) return;
    setEnquiries(p=>p.map(e=>e.id===id?{...e,
      status:"More Info",
      moreInfoThread:[...e.moreInfoThread,{from:"captain",text:moreInfoText,ts:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"})}],
    }:e));
    if(enq.agentEmail) {
      const subj = encodeURIComponent(`Charter Enquiry — More Information Required`);
      const body = encodeURIComponent(`Dear ${enq.agentName},\n\nRegarding your enquiry (${enq.startDate} → ${enq.endDate}):\n\n${moreInfoText}\n\nKind regards,\nCaptain`);
      window.open(`mailto:${enq.agentEmail}?subject=${subj}&body=${body}`);
    }
    logC("More Info Requested", `${enq.agentName} · ${moreInfoText.slice(0,40)}`);
    setMoreInfoId(null); setMoreInfoText("");
  }

  function saveRules() {
    setRules({...rulesForm});
    setRulesDirty(false);
    logC("Rules Updated","Availability rules saved");
  }
  function updateRules(patch) {
    setRulesForm(p=>({...p,...patch}));
    setRulesDirty(true);
  }
  function addBlackout() {
    if(!blackoutForm.start||!blackoutForm.end) return;
    const entry = {...blackoutForm, id:`bo_${Date.now()}`};
    updateRules({blackouts:[...(rulesForm.blackouts||[]),entry]});
    setBlackoutForm({start:TODAY,end:TODAY,label:""});
  }
  function removeBlackout(id) { updateRules({blackouts:rulesForm.blackouts.filter(b=>b.id!==id)}); }
  function addOwnerPriority() {
    if(!ownerForm.start||!ownerForm.end) return;
    const entry = {...ownerForm, id:`op_${Date.now()}`};
    updateRules({ownerPriority:[...(rulesForm.ownerPriority||[]),entry]});
    setOwnerForm({start:TODAY,end:TODAY,label:""});
  }
  function removeOwnerPriority(id) { updateRules({ownerPriority:rulesForm.ownerPriority.filter(o=>o.id!==id)}); }

  // ── Form save with rule warnings ─────────────────────────────
  function getFormWarnings() {
    if(!form.start) return [];
    const warns = [];
    // Check each day in range
    const s = new Date(form.start+"T00:00:00");
    const e = new Date(form.end+"T23:59:00");
    const checked = new Set();
    for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)) {
      const ds = d.toISOString().split("T")[0];
      if(checked.has(ds)) continue;
      checked.add(ds);
      const ev = evaluateDate(ds, allCalEntries.filter(x=>x.id!==editEntry?.id), rules);
      ev.reasons.forEach(r=>{ if(!warns.find(w=>w.label===r.label)) warns.push(r); });
    }
    return warns;
  }

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WDAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // ── Helpers ──────────────────────────────────────────────────
  function overlaps(entry, dateStr) {
    return dateStr >= entry.start && dateStr <= entry.end;
  }

  function entriesOnDate(dateStr) {
    return externalEntries.filter(e =>
      overlaps(e, dateStr) &&
      e.type!=="Available" &&
      !(isAgent && e.type==="Crew Leave") &&
      (typeFilter==="All" || e.type===typeFilter)
    );
  }

  function daysInMonth(y, m) { return new Date(y, m+1, 0).getDate(); }
  function firstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }

  function prevMonth() {
    if(curMonth===0) { setCurMonth(11); setCurYear(y=>y-1); }
    else setCurMonth(m=>m-1);
  }
  function nextMonth() {
    if(curMonth===11) { setCurMonth(0); setCurYear(y=>y+1); }
    else setCurMonth(m=>m+1);
  }

  // ── Form open/save/delete ────────────────────────────────────
  function openNew(dateStr) {
    const start = dateStr||TODAY;
    setEditEntry(null);
    setForm({type:"Available",title:"",start,end:start,startTime:"08:00",endTime:"18:00",notes:"",charterDetails:null});
    setSelected(null);
    setShowForm(true);
  }

  function openEdit(entry) {
    setEditEntry(entry);
    setForm({type:entry.type,title:entry.title,start:entry.start,end:entry.end,startTime:entry.startTime||"08:00",endTime:entry.endTime||"18:00",notes:entry.notes||"",charterDetails:entry.charterDetails||null});
    setSelected(null);
    setShowForm(true);
  }

  function save() {
    if(!form.title.trim()||!form.start||!form.end) return;
    if(form.end < form.start) { alert("End date must be on or after start date."); return; }
    if(editEntry) {
      setCalEntries(p=>p.map(e=>e.id===editEntry.id?{...e,...form}:e));
      logC("Calendar Updated", `${form.type}: ${form.title} (${form.start} → ${form.end})`);
    } else {
      const entry = {...form, id:`cal${Date.now()}`, createdBy:role};
      setCalEntries(p=>[...p, entry]);
      logC("Calendar Entry Added", `${form.type}: ${form.title} (${form.start} → ${form.end})`);
    }
    setShowForm(false);
  }

  function del(id) {
    const e = calEntries.find(x=>x.id===id);
    setCalEntries(p=>p.filter(x=>x.id!==id));
    logC("Calendar Entry Deleted", e?.title||id);
    setSelected(null);
  }

  // ── Month summary stats ───────────────────────────────────────
  const monthStr     = `${curYear}-${String(curMonth+1).padStart(2,"0")}`;
  const monthEntries = externalEntries.filter(e=>e.start.startsWith(monthStr)||e.end.startsWith(monthStr)||(e.start<monthStr+"-01"&&e.end>monthStr+"-31"));
  const typeCounts   = Object.fromEntries(Object.keys(AVAIL_TYPES).filter(t=>t!=="Available").map(t=>[t, externalEntries.filter(e=>e.type===t).length]));
  const filteredList = externalEntries.filter(e=>e.type!=="Available"&&!(isAgent&&e.type==="Crew Leave")&&(typeFilter==="All"||e.type===typeFilter)).sort((a,b)=>a.start.localeCompare(b.start));

  // ── Entry card (used in list + detail) ───────────────────────
  // Defence-in-depth: even if applyPrivacyLayer somehow passes
  // internal data, the render enforces external-safe display.
  function EntryCard({entry, compact}) {
    const displayType  = entry.type;
    const displayTitle = isAgent ? entry.type : entry.title;
    const t = AVAIL_TYPES[displayType]||AVAIL_TYPES.Unavailable;
    const nights = Math.max(0, Math.round((new Date(entry.end)-new Date(entry.start))/(1000*60*60*24)));
    const isEnquireOnly = isAgent && displayType==="Enquire Only";
    const isBooked      = !isAgent && entry.type==="Booked";
    const isLeave       = entry.type==="Crew Leave";

    let cardTouchY = 0;
    const openDetail = () => {
      if(isAgent) return;
      setDetailEntry(entry);
    };
    return <div style={{background:t.bg,border:`1px solid ${t.border}`,borderLeft:`3px solid ${t.color}`,borderRadius:9,padding:compact?"8px 11px":"12px 16px",marginBottom:compact?5:8,cursor:isAgent?"default":"pointer",userSelect:"none",WebkitUserSelect:"none"}}
      onTouchStart={e=>{cardTouchY=e.touches[0].clientY;}}
      onTouchEnd={e=>{
        if(Math.abs(e.changedTouches[0].clientY-cardTouchY)<8) openDetail();
      }}
      onClick={()=>{ if(!isMobile) openDetail(); }}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <div style={{flexShrink:0}}><Ico i={t.IconC||Umbrella} s={compact?14:18} c={t.color}/></div>
        <div style={{flex:1,minWidth:120}}>
          <div style={{fontSize:compact?12:14,fontWeight:700,color:t.color,lineHeight:1.2}}>{displayTitle}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>
            {entry.start===entry.end ? entry.start : `${entry.start} → ${entry.end}`}
            {nights>0&&!isAgent&&<span style={{marginLeft:6,color:t.color}}>· {nights} day{nights!==1?"s":""}</span>}
          </div>
          {isBooked&&!compact&&<div style={{marginTop:4,fontSize:10,color:t.color,fontWeight:600}}>{"Tap to view charter details ›"}</div>}
          {isLeave&&!compact&&<div style={{marginTop:4,fontSize:10,color:t.color,fontWeight:600}}>{"Approved leave — manage in Leave module"}</div>}
          {isEnquireOnly&&!compact&&<div style={{marginTop:6,fontSize:11,color:t.color,fontWeight:600}}>
            {"These dates may be available — submit an enquiry and the Captain will confirm."}
          </div>}
        </div>
        <span style={{fontSize:10,fontWeight:700,color:t.color,background:`${t.color}22`,padding:"2px 8px",borderRadius:10,border:`1px solid ${t.border}`,flexShrink:0}}>{displayType}</span>
      </div>
      {!isAgent&&!compact&&!isBooked&&!isLeave&&entry.notes&&<div style={{fontSize:11,color:C.muted,marginTop:7,paddingTop:7,borderTop:`1px solid ${t.border}`,fontStyle:"italic",lineHeight:1.5}}>{entry.notes}</div>}
      {!isAgent&&!compact&&isLeave&&entry.notes&&<div style={{fontSize:11,color:C.muted,marginTop:6,paddingTop:6,borderTop:`1px solid ${t.border}`,fontStyle:"italic"}}>{entry.notes}</div>}
      {!isAgent&&!compact&&entry.type==="Hold"&&<div style={{marginTop:6,padding:"5px 9px",background:C.amber+"15",borderRadius:5,fontSize:11,color:C.amber}}>
        {"On Hold — awaiting confirmation. Agents see this as \"Enquire Only\"."}
      </div>}
      {/* Edit controls — not shown for leave blocks (managed in Leave module) */}
      {!isAgent&&!isBooked&&!isLeave&&selected?.id===entry.id&&<div style={{display:"flex",gap:7,marginTop:9,paddingTop:8,borderTop:`1px solid ${t.border}`}}>
        <button onClick={e=>{e.stopPropagation();openEdit(entry);}} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"5px 14px",fontSize:11}}>{"Edit"}</button>
        <button onClick={e=>{e.stopPropagation();del(entry.id);}} style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"5px 14px",fontSize:11}}><span style={{display:"flex",alignItems:"center",gap:5}}><Trash2 size={13} strokeWidth={2}/>Delete</span></button>
        <div style={{flex:1}}/>
        <span style={{fontSize:10,color:C.muted,alignSelf:"center"}}>Added by {entry.createdBy}</span>
      </div>}
    </div>;
  }

  // ── MONTH GRID ────────────────────────────────────────────────
  function MonthGrid() {
    const total    = daysInMonth(curYear, curMonth);
    const firstDay = firstDayOfMonth(curYear, curMonth);
    const cells    = [];
    for(let i=0;i<firstDay;i++) cells.push(null);
    for(let day=1;day<=total;day++) {
      const dateStr = `${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      cells.push({d:day, dateStr, entries:entriesOnDate(dateStr)});
    }
    const isToday = (ds) => ds===TODAY;

    // Pill — purely visual, no touch handlers (cell handles all interaction)
    const renderPill = (entry) => {
      const t = AVAIL_TYPES[entry.type]||AVAIL_TYPES.Unavailable;
      const lbl = isAgent ? entry.type : entry.title;
      return (
        <div key={entry.id} style={{fontSize:9,background:t.bg,border:"1px solid "+t.border,color:t.color,
          borderRadius:3,padding:"1px 4px",marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",
          textOverflow:"ellipsis",fontWeight:600,lineHeight:1.4,pointerEvents:"none",
          userSelect:"none",WebkitUserSelect:"none"}}>
          {lbl}
        </div>
      );
    };

    // Cell tap logic — single source of truth
    const handleCellTap = (dateStr, entries) => {
      if(isAgent) return;
      if(entries.length===1) setDetailEntry(entries[0]);
      else if(entries.length>1) setMultiDetail({dateStr,entries});
      else if(canEdit) openNew(dateStr);
    };

    const renderCell = (cell, i) => {
      if(!cell) return <div key={"blank_"+i} style={{minHeight:70,background:C.navyMid,borderRadius:6,opacity:.3}}/>;
      const {d, dateStr, entries} = cell;
      const today = isToday(dateStr);
      const bg  = today ? C.brass+"18" : C.card;
      const bdr = "1px solid "+(today ? C.brass+"66" : C.border);
      return (
        <div key={dateStr}
          onClick={()=>handleCellTap(dateStr,entries)}
          style={{minHeight:70,background:bg,border:bdr,borderRadius:6,padding:"4px 5px",
            cursor:isAgent?"default":"pointer",position:"relative",overflow:"hidden",
            userSelect:"none",WebkitUserSelect:"none"}}>
          <div style={{fontSize:11,fontWeight:today?800:400,color:today?C.brass:C.text,lineHeight:1,marginBottom:3}}>{d}</div>
          {entries.slice(0,3).map(renderPill)}
          {entries.length>3&&<div style={{fontSize:8,color:C.muted}}>{"+"+(entries.length-3)}</div>}
          {entries.length>1&&<div style={{position:"absolute",top:3,right:4,fontSize:8,color:C.brass,fontWeight:800}}>{entries.length}</div>}
        </div>
      );
    };

    // Swipe state — shared across grid
    let swX=0,swY=0;

    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:3}}>
          {WDAYS.map(w=>(
            <div key={w} style={{fontSize:10,color:C.muted,textAlign:"center",padding:"4px 0",textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>{w}</div>
          ))}
        </div>
        <div
          onTouchStart={e=>{swX=e.touches[0].clientX;swY=e.touches[0].clientY;}}
          onTouchEnd={e=>{
            const dx=e.changedTouches[0].clientX-swX;
            const dy=Math.abs(e.changedTouches[0].clientY-swY);
            // Only swipe if horizontal movement dominates and no child handled it
            if(Math.abs(dx)>60&&dy<80&&Math.abs(dx)>Math.abs(dy)*1.5){
              if(dx<0)nextMonth();else prevMonth();
            }
          }}
          style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,touchAction:"pan-y"}}>
          {cells.map(renderCell)}
        </div>
      </div>
    );
  }

  return <div style={{touchAction:"pan-y"}}>

    {/* Header */}
    <div style={{position:"sticky",top:0,zIndex:50,background:C.bg,paddingBottom:10,marginBottom:4}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8,gap:8,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.navy}}>{"Yacht Calendar"}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>
          {isAgent?"Availability view — read only":"Availability · Bookings · Maintenance · Owner Usage"}
        </div>
        {/* Vessel switcher — shown when multiple vessels registered */}
        {!isAgent&&vesselRegistry.length>1&&<div style={{marginTop:6,display:"flex",gap:5,flexWrap:"wrap"}}>
          {vesselRegistry.map(v=>(
            <button key={v.id} onClick={()=>setActiveVesselId(v.id)}
              style={{...btn,padding:"3px 10px",fontSize:11,
                background:activeVessel?.id===v.id?C.brass:C.navyLight,
                color:activeVessel?.id===v.id?C.bg:C.muted,
                border:`1px solid ${activeVessel?.id===v.id?C.brass:C.border}`,
                fontWeight:activeVessel?.id===v.id?700:400}}>
              {v.profile.yachtName||"Unnamed"}
            </button>
          ))}
        </div>}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {/* Agent: vessel registry + submit enquiry */}
        {isAgent&&<>
          <button onClick={()=>setShowVesselPanel(true)}
            style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"8px 14px",display:"flex",alignItems:"center",gap:6}}>
            {"Vessels ("}{vesselRegistry.filter(v=>v.profile.isActive).length}{")"}
          </button>
          <button onClick={()=>setShowEnqForm(true)}
            style={{...btn,background:"#3b9fd4",color:C.white,padding:"8px 16px",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
            {"Submit Enquiry"}
          </button>
        </>}
        {/* Captain/Management: enquiry inbox */}
        {canEdit&&<button onClick={()=>setShowInbox(true)}
          style={{...btn,background:pendingEnquiries.length>0?C.amber:C.navyLight,color:pendingEnquiries.length>0?C.bg:C.muted,
            border:`1px solid ${pendingEnquiries.length>0?C.amber:C.border}`,padding:"8px 14px",fontWeight:700,display:"flex",alignItems:"center",gap:7,position:"relative"}}>
          {"Enquiries"}
          {pendingEnquiries.length>0&&<span style={{background:C.signal,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 7px",fontWeight:800}}>{pendingEnquiries.length}</span>}
        </button>}
        {canEdit&&!isMobile&&<button onClick={()=>openNew(null)} style={{...btn,background:C.brass,color:C.bg,padding:"8px 16px",fontWeight:700}}>{"+ New Entry"}</button>}
      </div>
    </div>
    </div>

    {/* Mobile FAB — hidden on vessel/rules tabs where it conflicts with form fields */}
    {canEdit&&isMobile&&viewMode!=="vessel"&&<div style={{position:"fixed",bottom:90,right:18,zIndex:200}}>
      <button onClick={()=>openNew(null)}
        style={{...btn,background:C.brass,color:C.bg,width:54,height:54,borderRadius:"50%",fontSize:26,padding:0,boxShadow:"0 4px 16px rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {"+"}
      </button>
    </div>}

    {/* External privacy banner — always shown to agents */}
    {isAgent&&<div style={{background:"#3b9fd422",border:"1px solid #3b9fd455",borderRadius:9,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <div style={{flexShrink:0}}><Ico i={Lock} s={18} c={C.muted}/></div>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:"#3b9fd4"}}>Agent View — Availability Only</div>
        <div style={{fontSize:11,color:C.muted,marginTop:1}}>
          Shows: <strong style={{color:AVAIL_TYPES.Available.color}}>Available</strong> · <strong style={{color:AVAIL_TYPES.Unavailable.color}}>Unavailable</strong>
          &nbsp;— Operational details are private.
        </div>
      </div>
    </div>}

    {/* Type filter — single scrollable row, only active types shown */}
    <div style={{display:"flex",gap:5,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:6,marginBottom:8,scrollbarWidth:"none"}}>
      <button onClick={()=>setTypeFilter("All")}
        style={{...btn,flexShrink:0,background:typeFilter==="All"?C.brass:C.navyLight,color:typeFilter==="All"?C.bg:C.muted,
          border:`1px solid ${typeFilter==="All"?C.brass:C.border}`,padding:"5px 12px",fontSize:11,fontWeight:typeFilter==="All"?700:400}}>
        All
      </button>
      {(isAgent
        ? [["Unavailable",AVAIL_TYPES.Unavailable],["Enquire Only",AVAIL_TYPES["Enquire Only"]]]
        : Object.entries(AVAIL_TYPES).filter(([type])=>type!=="Available"&&typeCounts[type]>0)
      ).map(([type,t])=>(
        <button key={type} onClick={()=>setTypeFilter(typeFilter===type?"All":type)}
          style={{...btn,flexShrink:0,background:typeFilter===type?t.bg:C.navyLight,
            color:typeFilter===type?t.color:C.muted,
            border:`1px solid ${typeFilter===type?t.border:C.border}`,
            padding:"5px 12px",fontSize:11,fontWeight:typeFilter===type?700:400,whiteSpace:"nowrap"}}>
          {type}{typeCounts[type]>0?` (${typeCounts[type]})`:""} 
        </button>
      ))}
    </div>

    {/* Month nav + view toggle */}
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <button onClick={prevMonth} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:14}}>‹</button>
        <div style={{fontSize:16,fontWeight:800,color:C.navy,minWidth:160,textAlign:"center"}}>{MONTHS[curMonth]} {curYear}</div>
        <button onClick={nextMonth} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:14}}>›</button>
        <button onClick={()=>{setCurMonth(new Date().getMonth());setCurYear(new Date().getFullYear());}}
          style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 10px",fontSize:11}}>Today</button>
      </div>
      <div style={{marginLeft:"auto",display:"flex",background:C.navyLight,borderRadius:7,padding:2,gap:1}}>
        {[["month","Month"],["list","≡ List"],...(canEdit?[["vessel","Vessel"]]:[])]
          .map(([id,lbl])=>(
          <button key={id} onClick={()=>{setViewMode(id);if(id==="vessel")setShowForm(false);}}
            style={{...btn,background:viewMode===id?C.card:"transparent",color:viewMode===id?C.navy:C.muted,border:"none",padding:"5px 13px",fontSize:12,fontWeight:viewMode===id?700:400,position:"relative"}}>
            {lbl}
            {id==="vessel"&&(profileDirty||rulesDirty)&&<span style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:C.amber}}/>}
          </button>
        ))}
      </div>
    </div>

    {/* Month stats strip — external: only Available/Unavailable shown */}
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {(isAgent
        ? [["Available",AVAIL_TYPES.Available],["Enquire Only",AVAIL_TYPES["Enquire Only"]],["Unavailable",AVAIL_TYPES.Unavailable]]
        : Object.entries(AVAIL_TYPES)
      ).map(([type,t])=>{
        const cnt = monthEntries.filter(e=>e.type===type).length;
        if(!cnt) return null;
        return <div key={type} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
          <Ico i={t.IconC||Calendar} s={12} c={t.color}/>
          <span style={{fontSize:11,color:t.color,fontWeight:600}}>{cnt} {type}</span>
        </div>;
      })}
      {monthEntries.length===0&&<div style={{fontSize:11,color:C.muted}}>No entries this month</div>}
    </div>

    {/* MONTH VIEW */}
    {viewMode==="month"&&<MonthGrid/>}

    {/* LIST VIEW */}
    {viewMode==="list"&&<div>
      {filteredList.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Calendar} s={28} c={C.muted}/></div>
        <div>No calendar entries{typeFilter!=="All"?` for ${typeFilter}`:""}</div>
        {canEdit&&!isAgent&&<button onClick={()=>openNew(null)} style={{...btn,background:C.brass,color:C.bg,marginTop:12}}>+ Add First Entry</button>}
      </div>}
      {filteredList.map(entry=><EntryCard key={entry.id} entry={entry}/>)}
    </div>}

    {/* Selected entry popup (month view) — not shown to agents */}
    {viewMode==="month"&&selected&&!isAgent&&<div style={{marginTop:14}}>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Selected Entry</div>
      <EntryCard entry={selected}/>
    </div>}

    {/* ── VESSEL PROFILE (captain only) ── */}
    {viewMode==="vessel"&&canEdit&&<div>

      {(profileDirty||rulesDirty)&&<div style={{background:C.amber+"18",border:`1px solid ${C.amber}44`,borderRadius:8,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <span style={{fontSize:12,color:C.amber,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Ico i={AlertTriangle} s={11} c={C.amber}/>{"Unsaved changes"}</span>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setProfileForm({...profile});setProfileDirty(false);setRulesForm({...rules});setRulesDirty(false);}} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"4px 12px",fontSize:11}}>Discard</button>
          <button onClick={saveProfile} style={{...btn,background:C.brass,color:C.bg,padding:"4px 14px",fontSize:11,fontWeight:700}}>Save</button>
        </div>
      </div>}

      {/* Profile completeness — proper component, no IIFE */}
      {(s=>(<ProfileScorePanel pct={s.pct} missing={s.missing} missingCritical={s.missingCritical} agentReady={s.agentReady} col={s.pct===100?C.greenL:s.agentReady?C.amber:C.signal} C={C} PROFILE_THRESHOLD={PROFILE_THRESHOLD}/>))(calcProfileScore(profileForm, rulesForm))}

      {(()=>{
        const Fld = ({label,required,children}) => <VesselProfileField label={label} required={required} C={C}>{children}</VesselProfileField>;
        const fi = {...inp, padding:"8px 12px", width:"100%"};
        return <>

          {/* ── YACHT TYPE SELECTOR ─────────────────────────────────── */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>Yacht Type</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[
                {type:"Charter",   icon:"⛵", desc:"Available for bookings. Agents can enquire.",           color:C.greenL},
                {type:"Private",   icon:"🔒", desc:"Not actively bookable. No pricing required.",            color:C.blue},
                {type:"Mixed Use", icon:"🔀", desc:"Toggle between private and charter availability.",       color:C.brass},
              ].map(({type,icon,desc,color})=>(
                <div key={type} onClick={()=>updateProfile({
                  yachtType:type,
                  isCharterEnabled: type!=="Private",
                  agentVisible:     type!=="Private",
                })}
                  style={{background:profileForm.yachtType===type?`${color}18`:C.navyLight,
                    border:`2px solid ${profileForm.yachtType===type?color:C.border}`,
                    borderRadius:10,padding:"11px 12px",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{fontSize:18,marginBottom:5}}>{icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:profileForm.yachtType===type?color:C.text,marginBottom:4}}>{type}</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{desc}</div>
                  {profileForm.yachtType===type&&<div style={{marginTop:6,fontSize:9,color:color,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── VESSEL IDENTITY ────────────────────────────────────────── */}
          <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>Vessel Identity</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <Fld label="Yacht Name" required>
                <input value={profileForm.yachtName} onChange={e=>updateProfile({yachtName:e.target.value})} placeholder="e.g. M/Y Tiberius" style={fi}/>
              </Fld>
            </div>
            <Fld label="Vessel Class" required>
              <select value={profileForm.vesselClass||"Motor Yacht"} onChange={e=>updateProfile({vesselClass:e.target.value})} style={fi}>
                {VESSEL_CLASSES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Fld>
            <Fld label="Length (metres)">
              <input type="number" min={0} value={profileForm.lengthM} onChange={e=>updateProfile({lengthM:e.target.value})} placeholder="e.g. 28" style={fi}/>
            </Fld>
            <Fld label="Guest Capacity" required>
              <input type="number" min={0} value={profileForm.guestCapacity} onChange={e=>updateProfile({guestCapacity:e.target.value})} placeholder="Day guests" style={fi}/>
            </Fld>
            <Fld label="Overnight Capacity" required>
              <input type="number" min={0} value={profileForm.overnightCapacity} onChange={e=>updateProfile({overnightCapacity:e.target.value})} placeholder="Sleeping guests" style={fi}/>
            </Fld>
          </div>

          {/* ── OFFICIAL DOCUMENTATION ───────────────────────────────── */}
          <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,marginTop:4}}>
            Official Documentation
          </div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>
            Required for MLC Hours of Rest forms, ISM documentation, and flag state compliance.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Fld label="IMO Number">
              <input value={profileForm.imoNumber||""} onChange={e=>updateProfile({imoNumber:e.target.value})} placeholder="e.g. IMO 1234567" style={fi}/>
            </Fld>
            <Fld label="Flag State">
              <input value={profileForm.flagState||""} onChange={e=>updateProfile({flagState:e.target.value})} placeholder="e.g. Cayman Islands" style={fi}/>
            </Fld>
            <Fld label="Port of Registry">
              <input value={profileForm.portOfRegistry||""} onChange={e=>updateProfile({portOfRegistry:e.target.value})} placeholder="e.g. George Town, Cayman Islands" style={fi}/>
            </Fld>
            <Fld label="Official Number">
              <input value={profileForm.officialNumber||""} onChange={e=>updateProfile({officialNumber:e.target.value})} placeholder="Flag state vessel number" style={fi}/>
            </Fld>
            <Fld label="Call Sign">
              <input value={profileForm.callSign||""} onChange={e=>updateProfile({callSign:e.target.value})} placeholder="e.g. ZCLA4" style={fi}/>
            </Fld>
            <Fld label="MMSI">
              <input value={profileForm.mmsi||""} onChange={e=>updateProfile({mmsi:e.target.value})} placeholder="9-digit MMSI number" style={fi}/>
            </Fld>
            <Fld label="Gross Tonnage (GT)">
              <input value={profileForm.grossTonnage||""} onChange={e=>updateProfile({grossTonnage:e.target.value})} placeholder="e.g. 24" style={fi}/>
            </Fld>
          </div>

          {/* ── LOCATION ─────────────────────────────────────────────── */}
          <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,marginTop:4}}>Location</div>
          <Fld label="Home Marina" required>
            <input value={profileForm.homeMarina} onChange={e=>updateProfile({homeMarina:e.target.value})} placeholder="e.g. Dubai Marina, Berth 14" style={fi}/>
          </Fld>
          <Fld label="Primary Operating Region" required>
            <select value={profileForm.operatingRegion} onChange={e=>updateProfile({operatingRegion:e.target.value})} style={fi}>
              {OPERATING_REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </Fld>
          <Fld label="Additional Regions">
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {OPERATING_REGIONS.filter(r=>r!==profileForm.operatingRegion).map(r=>{
                const sel=(profileForm.additionalRegions||[]).includes(r);
                return <button key={r} onClick={()=>updateProfile({additionalRegions:sel?(profileForm.additionalRegions||[]).filter(x=>x!==r):[...(profileForm.additionalRegions||[]),r]})}
                  style={{...btn,background:sel?C.brass+"22":C.navyLight,color:sel?C.brass:C.muted,border:`1px solid ${sel?C.brass+"55":C.border}`,padding:"3px 9px",fontSize:10}}>{r}</button>;
              })}
            </div>
          </Fld>

          {/* ── CHARTER CONFIG — only for Charter / Mixed Use ──────── */}
          {profileForm.yachtType!=="Private"&&<>
            <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,marginTop:4}}>Charter Configuration</div>
            <Fld label="Charter Types Offered">
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {CHARTER_TYPE_OPTIONS.map(t=>{
                  const sel=(profileForm.charterTypes||[]).includes(t);
                  return <button key={t} onClick={()=>updateProfile({charterTypes:sel?(profileForm.charterTypes||[]).filter(x=>x!==t):[...(profileForm.charterTypes||[]),t]})}
                    style={{...btn,background:sel?C.greenL:C.navyLight,color:sel?C.bg:C.muted,border:`1px solid ${sel?C.greenL:C.border}`,padding:"4px 10px",fontSize:11}}>{t}</button>;
                })}
              </div>
            </Fld>
            <Fld label="Amenities">
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {AMENITY_OPTIONS.map(a=>{
                  const sel=(profileForm.amenities||[]).includes(a);
                  return <button key={a} onClick={()=>updateProfile({amenities:sel?(profileForm.amenities||[]).filter(x=>x!==a):[...(profileForm.amenities||[]),a]})}
                    style={{...btn,background:sel?"#3b9fd422":C.navyLight,color:sel?"#3b9fd4":C.muted,border:`1px solid ${sel?"#3b9fd455":C.border}`,padding:"3px 9px",fontSize:10}}>{a}</button>;
                })}
              </div>
            </Fld>
          </>}

          {/* ── CAPTAIN REGISTRY CONTROLS ─────────────────────────── */}
          <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,marginTop:4}}>Captain Controls</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Only the Captain controls registry visibility. No yacht is exposed externally without explicit consent.</div>
            {[
              {key:"isActive",          label:"Active in Registry",          desc:"Vessel exists in the system. Turn off to deactivate completely."},
              {key:"isCharterEnabled",  label:"Charter Enabled",             desc:"Eligible for agent enquiries. Applies to Charter and Mixed Use only.", disabled:profileForm.yachtType==="Private"},
              {key:"agentVisible",      label:"Visible to Agents",           desc:"Appears in future agent search. Requires charter to be enabled.",    disabled:!profileForm.isCharterEnabled||profileForm.yachtType==="Private"},
              {key:"showPricingToAgent",label:"Show Pricing to Agents",      desc:"Whether daily rate is revealed in agent-facing views.",              disabled:!profileForm.isCharterEnabled},
            ].map(({key,label,desc,disabled})=>{
              const val = !!profileForm[key];
              return <div key={key} style={{display:"flex",alignItems:"center",gap:10,paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${C.border}`,opacity:disabled?.5:1}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:disabled?C.muted:C.white}}>{label}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2,lineHeight:1.4}}>{desc}</div>
                </div>
                <div onClick={()=>!disabled&&updateProfile({[key]:!val})}
                  style={{width:44,height:24,borderRadius:12,background:val&&!disabled?C.greenL:C.navyLight,border:`1px solid ${val&&!disabled?C.greenL:C.border}`,cursor:disabled?"not-allowed":"pointer",position:"relative",flexShrink:0,transition:"background .2s"}}>
                  <div style={{position:"absolute",top:3,left:val&&!disabled?22:3,width:16,height:16,borderRadius:"50%",background:val&&!disabled?"#fff":C.muted,transition:"left .2s"}}/>
                </div>
              </div>;
            })}
          </div>

          {/* ── RATES — Charter / Mixed Use only ──────────────────── */}
          {profileForm.yachtType!=="Private"&&<>
            <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,marginTop:4}}>
              Rates <span style={{color:C.muted,fontWeight:400,fontSize:9,textTransform:"none"}}>Internal — never exposed unless you enable "Show Pricing to Agents"</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <Fld label="Hourly Rate (optional)">
                <div style={{display:"flex",gap:5}}>
                  <select value={profileForm.currency} onChange={e=>updateProfile({currency:e.target.value})} style={{...fi,width:70,flexShrink:0}}>
                    {["AED","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input type="number" min={0} value={profileForm.hourlyRate} onChange={e=>updateProfile({hourlyRate:e.target.value})} placeholder="0" style={{...fi,flex:1}}/>
                </div>
              </Fld>
              <Fld label="Daily Rate">
                <input type="number" min={0} value={profileForm.dailyRate} onChange={e=>updateProfile({dailyRate:e.target.value})} placeholder="0" style={fi}/>
              </Fld>
            </div>
          </>}

          {/* ── CHARTER RULES — only for Charter / Mixed Use vessels ── */}
          {(profileForm.yachtType==="Charter"||profileForm.yachtType==="Mixed Use")&&<>
            <div style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8,marginTop:16,display:"flex",alignItems:"center",gap:6}}>
              <Ico i={Shield} s={13} c={C.brass}/>Charter Rules
              <span style={{fontSize:9,color:C.muted,fontWeight:400,textTransform:"none",letterSpacing:0}}>— enforced by the calendar · shared with agents</span>
            </div>

            {/* Minimum Notice */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>Minimum booking notice</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>How far in advance must a charter start? Dates within this window are blocked from agent booking.</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[[0,"Off"],[24,"24h"],[48,"48h"],[72,"72h"],[168,"7 days"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{updateRules({minNoticeHours:v});setRulesDirty(true);}}
                    style={{...btn,background:rulesForm.minNoticeHours===v?C.brass:C.navyLight,color:rulesForm.minNoticeHours===v?C.bg:C.muted,
                      border:`1px solid ${rulesForm.minNoticeHours===v?C.brass:C.border}`,padding:"6px 14px",fontSize:12,fontWeight:rulesForm.minNoticeHours===v?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Turnaround */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>Turnaround time between charters</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Minimum gap after a booking ends — for cleaning, handover, and crew prep.</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[[0,"Off"],[12,"12h"],[24,"24h"],[48,"48h"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{updateRules({turnaroundHours:v});setRulesDirty(true);}}
                    style={{...btn,background:rulesForm.turnaroundHours===v?C.brass:C.navyLight,color:rulesForm.turnaroundHours===v?C.bg:C.muted,
                      border:`1px solid ${rulesForm.turnaroundHours===v?C.brass:C.border}`,padding:"6px 14px",fontSize:12,fontWeight:rulesForm.turnaroundHours===v?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Maintenance buffer */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>Maintenance buffer</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Days blocked around maintenance periods — for mobilisation and commissioning.</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[[0,"Off"],[1,"1 day"],[2,"2 days"],[3,"3 days"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{updateRules({maintBufferDays:v});setRulesDirty(true);}}
                    style={{...btn,background:rulesForm.maintBufferDays===v?C.brass:C.navyLight,color:rulesForm.maintBufferDays===v?C.bg:C.muted,
                      border:`1px solid ${rulesForm.maintBufferDays===v?C.brass:C.border}`,padding:"6px 14px",fontSize:12,fontWeight:rulesForm.maintBufferDays===v?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>}

          {(profileDirty||rulesDirty)&&<button onClick={saveProfile}
            style={{...btn,background:C.brass,color:C.bg,width:"100%",padding:"11px 0",fontWeight:700,fontSize:13,marginTop:4}}>
            {"Save Vessel Profile"}
          </button>}

          {/* Saved profile preview */}
          {!profileDirty&&profile.yachtName&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Saved Profile</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
              {[
                ["Vessel",     profile.yachtName],
                ["Type",       profile.yachtType],
                ["Length",     profile.lengthM?`${profile.lengthM}m`:"—"],
                ["Day guests", profile.guestCapacity||"—"],
                ["Overnight",  profile.overnightCapacity||"—"],
                ["Marina",     profile.homeMarina||"—"],
                ["Region",     profile.operatingRegion||"—"],
              ].map(([k,v])=>(
                <div key={k} style={{fontSize:11}}>
                  <span style={{color:C.muted}}>{k}: </span>
                  <span style={{color:C.text,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            {(profile.dailyRate||profile.hourlyRate)&&<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`,fontSize:11,color:C.muted,display:"flex",gap:12}}>
              (<Lock size={14} strokeWidth={2}/>)
              {profile.hourlyRate&&<span>{profile.currency} {Number(profile.hourlyRate).toLocaleString()}/hr</span>}
              {profile.dailyRate&&<span>{profile.currency} {Number(profile.dailyRate).toLocaleString()}/day</span>}
            </div>}
          </div>}
        </>;
      })()}
    </div>}

    {/* ── AGENT: MY ENQUIRIES ── */}
    {isAgent&&enquiries.length>0&&<div style={{marginTop:16}}>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>My Submitted Enquiries</div>
      {enquiries.map(enq=>{
        const sc = enq.status==="Accepted"?C.greenL:enq.status==="Declined"?C.signal:enq.status==="More Info"?"#9b59b6":C.amber;
        return <div key={enq.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:9,padding:"11px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{enq.startDate===enq.endDate?enq.startDate:`${enq.startDate} → ${enq.endDate}`}</span>
                <span style={{fontSize:10,background:`${sc}22`,color:sc,padding:"2px 8px",borderRadius:10,fontWeight:700,border:`1px solid ${sc}44`}}>{enq.status}</span>
              </div>
              <div style={{fontSize:11,color:C.muted}}>{enq.guests} guests · {enq.charterType} · Submitted {enq.submittedAt}</div>
              {enq.captainResponse&&<div style={{fontSize:11,color:C.text,marginTop:6,padding:"6px 9px",background:C.navyLight,borderRadius:6,fontStyle:"italic"}}>"{enq.captainResponse}"</div>}
              {enq.moreInfoThread?.length>0&&enq.moreInfoThread.map((t,i)=>(
                <div key={i} style={{fontSize:11,color:"#9b59b6",marginTop:5,padding:"5px 9px",background:"#9b59b622",borderRadius:6,display:"flex",alignItems:"flex-start",gap:6}}><Ico i={MessageSquare} s={11} c="#9b59b6"/> {t.text}</div>
              ))}
            </div>
          </div>
        </div>;
      })}
    </div>}

    {/* ── AGENT: VESSEL REGISTRY PANEL ── */}
    {showVesselPanel&&isAgent&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.93)",display:"flex",alignItems:"flex-end",justifyContent:"flex-end",zIndex:700}} onClick={()=>setShowVesselPanel(false)}>
      <div style={{position:"relative",background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px 0 0 0",width:"min(580px,100vw)",height:"90vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>

        {/* Panel header */}
        <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}><Ico i={Anchor} s={15} c={C.navy}/>{"Vessel Registry"}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {vesselFormMode==="list"&&<button onClick={()=>setVesselFormMode("add")} style={{...btn,background:C.brass,color:C.bg,padding:"5px 13px",fontSize:12,fontWeight:700}}>+ Add Vessel</button>}
              {vesselFormMode!=="list"&&<button onClick={()=>setVesselFormMode("list")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:12}}>← Back</button>}
              <button onClick={()=>setShowVesselPanel(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted}}>
            {vesselRegistry.filter(v=>v.profile.isActive).length} active · {vesselRegistry.length} total · Queryable for AI availability search
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px 18px 24px"}}>

          {/* LIST MODE */}
          {vesselFormMode==="list"&&<div>
            {vesselRegistry.map(vessel=>{
              const p = vessel.profile;
              const avail = vessel.calEntries.filter(e=>e.type==="Available").length;
              const isNative = vessel.id==="vsl_tiberius";
              return <div key={vessel.id} style={{background:C.navyLight,border:`1px solid ${p.isActive?C.border:C.border+"55"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,opacity:p.isActive?1:.6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.navy}}>{p.yachtName||"(unnamed)"}</span>
                      {isNative&&<span style={{fontSize:9,background:C.brass+"22",color:C.brass,padding:"2px 7px",borderRadius:8,fontWeight:700}}>ACTIVE VESSEL</span>}
                      <span style={{fontSize:9,background:p.isActive?C.greenL+"22":C.signal+"22",color:p.isActive?C.greenL:C.signal,padding:"2px 7px",borderRadius:8,fontWeight:700}}>{p.isActive?"Active":"Inactive"}</span>
                    </div>
                    <div style={{fontSize:11,color:C.muted,display:"flex",gap:12,flexWrap:"wrap"}}>
                      <span>{p.operatingRegion}</span>
                      <span>{p.guestCapacity||"—"} guests</span>
                      {p.lengthM&&<span>{p.lengthM}m</span>}
                      <span>{p.vesselClass||p.yachtType}</span>
                    </div>
                    {p.charterTypes?.length>0&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>{p.charterTypes.join(" · ")}</div>}
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>
                      {avail} available windows · {vessel.calEntries.length} total entries
                    </div>
                    {/* AI search fields summary */}
                    <div style={{marginTop:6,padding:"5px 8px",background:C.card,borderRadius:5,fontSize:9,color:C.muted,lineHeight:1.8}}>
                      <span style={{color:C.brass,fontWeight:700}}>AI fields: </span>
                      region="{p.operatingRegion}" · guests={p.guestCapacity||"?"} · type="{p.yachtType}" · class="{p.vesselClass||"?"}"
                      {p.additionalRegions?.length>0&&` · +${p.additionalRegions.length} regions`}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                    {!isNative&&<button onClick={()=>toggleVesselActive(vessel.id)} style={{...btn,background:p.isActive?C.signal+"22":C.greenL+"22",color:p.isActive?C.signal:C.greenL,border:`1px solid ${p.isActive?C.signal:C.greenL}44`,padding:"4px 10px",fontSize:10}}>
                      {p.isActive?"Deactivate":"Activate"}
                    </button>}
                    {!isNative&&<button onClick={()=>removeVesselFromRegistry(vessel.id)} style={{...btn,background:"transparent",color:C.signal,border:`1px solid ${C.signal}44`,padding:"4px 10px",fontSize:10}}>Remove</button>}
                  </div>
                </div>
              </div>;
            })}

            {/* Query preview */}
            <div style={{marginTop:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 14px"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico i={Search} s={10} c={C.muted}/>{"Query Preview — AI Ready"}</div>
              <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>
                When AI is enabled, agents can search:<br/>
                <span style={{color:C.text}}>"Available yachts in Dubai for 10 guests this weekend"</span><br/>
                <span style={{color:C.text}}>"Motor yachts in Mediterranean next week"</span><br/>
                <span style={{color:C.text}}>"Vessels with jet ski available from 15 July"</span>
              </div>
              <div style={{marginTop:8,fontSize:10,color:C.muted}}>
                Registry: <strong style={{color:C.navy}}>{vesselRegistry.length} vessel{vesselRegistry.length!==1?"s":""}</strong> ·
                Active: <strong style={{color:C.greenL}}>{vesselRegistry.filter(v=>v.profile.isActive).length}</strong> ·
                Available windows: <strong style={{color:C.brass}}>{vesselRegistry.reduce((sum,v)=>sum+v.calEntries.filter(e=>e.type==="Available").length,0)}</strong>
              </div>
            </div>
          </div>}

          {/* ADD VESSEL MODE */}
          {vesselFormMode==="add"&&<div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Register New Vessel</div>

            {[
              ["Vessel Name","text","yachtName","e.g. M/Y Sea Spirit"],
            ].map(([lbl,type,key,ph])=>(
              <div key={key} style={{marginBottom:11}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{lbl} <span style={{color:C.signal}}>*</span></div>
                <input type={type} value={newVesselForm[key]} onChange={e=>setNewVesselForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
              </div>
            ))}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Yacht Type</div>
                <select value={newVesselForm.yachtType} onChange={e=>setNewVesselForm(p=>({...p,yachtType:e.target.value}))} style={{...inp,width:"100%",padding:"7px 9px",fontSize:12}}>
                  {["Private","Charter","Mixed Use"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Vessel Class</div>
                <select value={newVesselForm.vesselClass} onChange={e=>setNewVesselForm(p=>({...p,vesselClass:e.target.value}))} style={{...inp,width:"100%",padding:"7px 9px",fontSize:12}}>
                  {VESSEL_CLASSES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Length (m)</div>
                <input type="number" value={newVesselForm.lengthM} onChange={e=>setNewVesselForm(p=>({...p,lengthM:e.target.value}))} placeholder="e.g. 24" style={{...inp,width:"100%",padding:"7px 9px",fontSize:12}}/>
              </div>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Guest Capacity</div>
                <input type="number" value={newVesselForm.guestCapacity} onChange={e=>setNewVesselForm(p=>({...p,guestCapacity:e.target.value}))} placeholder="Max guests" style={{...inp,width:"100%",padding:"7px 9px",fontSize:12}}/>
              </div>
            </div>

            <div style={{marginBottom:11}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Operating Region <span style={{color:C.signal}}>*</span></div>
              <select value={newVesselForm.operatingRegion} onChange={e=>setNewVesselForm(p=>({...p,operatingRegion:e.target.value}))} style={{...inp,width:"100%",padding:"7px 9px",fontSize:12}}>
                {OPERATING_REGIONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>

            <div style={{marginBottom:11}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Charter Types Offered</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {CHARTER_TYPE_OPTIONS.map(t=>{
                  const sel = newVesselForm.charterTypes.includes(t);
                  return <button key={t} onClick={()=>setNewVesselForm(p=>({...p,charterTypes:sel?p.charterTypes.filter(x=>x!==t):[...p.charterTypes,t]}))}
                    style={{...btn,background:sel?C.brass:C.navyLight,color:sel?C.bg:C.muted,border:`1px solid ${sel?C.brass:C.border}`,padding:"4px 10px",fontSize:11}}>
                    {t}
                  </button>;
                })}
              </div>
            </div>

            <div style={{marginBottom:11}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Amenities</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {AMENITY_OPTIONS.map(a=>{
                  const sel = newVesselForm.amenities.includes(a);
                  return <button key={a} onClick={()=>setNewVesselForm(p=>({...p,amenities:sel?p.amenities.filter(x=>x!==a):[...p.amenities,a]}))}
                    style={{...btn,background:sel?"#3b9fd422":C.navyLight,color:sel?"#3b9fd4":C.muted,border:`1px solid ${sel?"#3b9fd455":C.border}`,padding:"3px 9px",fontSize:10}}>
                    {a}
                  </button>;
                })}
              </div>
            </div>

            <div style={{background:"#3b9fd412",border:"1px solid #3b9fd433",borderRadius:7,padding:"7px 10px",marginBottom:14,fontSize:10,color:"#3b9fd4"}}>
              {"All fields above are indexed for AI availability search. Once registered, this vessel's calendar will appear in agent queries."}
            </div>

            <button onClick={addVesselToRegistry} disabled={!newVesselForm.yachtName.trim()}
              style={{...btn,background:C.brass,color:C.bg,width:"100%",padding:"11px 0",fontWeight:700,fontSize:13,opacity:newVesselForm.yachtName.trim()?1:.5}}>
              {"Register Vessel in Registry"}
            </button>
          </div>}
        </div>
      </div>
    </div>}

    {/* ── AGENT ENQUIRY FORM MODAL ── */}
    {showEnqForm&&isAgent&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.93)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:700,padding:16,overflowY:"auto"}} onClick={()=>setShowEnqForm(false)}>
      <div style={{background:C.card,border:"1px solid #3b9fd455",borderRadius:14,width:480,maxWidth:"96vw",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}><Ico i={Send} s={15} c={C.navy}/>{"Submit Charter Enquiry"}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Enquiry only — not a confirmed booking</div>
          </div>
          <button onClick={()=>setShowEnqForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:24,padding:0}}>×</button>
        </div>

        {/* Charter dates */}
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Requested Dates</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Start Date</div>
            <input type="date" value={enqForm.startDate} onChange={e=>setEnqForm(p=>({...p,startDate:e.target.value}))} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>End Date</div>
            <input type="date" value={enqForm.endDate} min={enqForm.startDate} onChange={e=>setEnqForm(p=>({...p,endDate:e.target.value}))} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
        </div>

        {/* Guests + charter type */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Number of Guests</div>
            <input type="number" min={1} max={50} value={enqForm.guests} onChange={e=>setEnqForm(p=>({...p,guests:Number(e.target.value)}))} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Charter Type</div>
            <select value={enqForm.charterType} onChange={e=>setEnqForm(p=>({...p,charterType:e.target.value}))} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}>
              {CHARTER_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Agent contact */}
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Your Contact Details</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Full Name <span style={{color:C.signal}}>*</span></div>
          <input value={enqForm.agentName} onChange={e=>setEnqForm(p=>({...p,agentName:e.target.value}))} placeholder="Your name" style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Email <span style={{color:C.signal}}>*</span></div>
            <input type="email" value={enqForm.agentEmail} onChange={e=>setEnqForm(p=>({...p,agentEmail:e.target.value}))} placeholder="agent@email.com" style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Phone</div>
            <input value={enqForm.agentPhone} onChange={e=>setEnqForm(p=>({...p,agentPhone:e.target.value}))} placeholder="+971…" style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
        </div>

        {/* Notes */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Additional Notes</div>
          <textarea value={enqForm.notes} onChange={e=>setEnqForm(p=>({...p,notes:e.target.value}))}
            placeholder="Guest preferences, occasion, specific requirements…"
            rows={3} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12,resize:"vertical",lineHeight:1.5}}/>
        </div>

        <div style={{background:"#3b9fd412",border:"1px solid #3b9fd433",borderRadius:7,padding:"7px 11px",marginBottom:14,fontSize:10,color:"#3b9fd4"}}>
          {"This is an enquiry only. The Captain will review and respond. No payment or booking is made at this stage."}
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>setShowEnqForm(false)} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`}}>Cancel</button>
          <button onClick={submitEnquiry} disabled={!enqForm.agentName.trim()||!enqForm.agentEmail.trim()||!enqForm.startDate}
            style={{...btn,flex:2,background:"#3b9fd4",color:C.text,fontWeight:700,opacity:enqForm.agentName.trim()&&enqForm.agentEmail.trim()?1:.5}}>
            {"Submit Enquiry"}
          </button>
        </div>
      </div>
    </div>}

    {/* ── CAPTAIN ENQUIRY INBOX ── */}
    {showInbox&&canEdit&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.93)",display:"flex",alignItems:"flex-end",justifyContent:"flex-end",zIndex:700}} onClick={()=>setShowInbox(false)}>
      <div style={{position:"relative",background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px 0 0 0",
        width:"min(560px,100vw)",height:"85vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>

        {/* Inbox header */}
        <div style={{padding:"16px 20px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:7}}><Ico i={Mail} s={15} c={C.navy}/>{"Charter Enquiries"}</div>
            <button onClick={()=>setShowInbox(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>
          </div>
          <div style={{display:"flex",gap:10,fontSize:11}}>
            <span style={{color:C.amber,fontWeight:700}}>{pendingEnquiries.length} pending</span>
            <span style={{color:C.muted}}>·</span>
            <span style={{color:C.muted}}>{enquiries.length} total</span>
          </div>
        </div>

        {/* Enquiry list */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 18px 24px"}}>
          {enquiries.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Mail} s={32} c={C.muted}/></div>
            <div>No enquiries yet</div>
          </div>}

          {enquiries.map(enq=>{
            const sc = enq.status==="Accepted"?C.greenL:enq.status==="Declined"?C.signal:enq.status==="More Info"?"#9b59b6":C.amber;
            const nights = Math.max(0,Math.round((new Date(enq.endDate)-new Date(enq.startDate))/(1000*60*60*24)));
            const isOpen = moreInfoId===enq.id;
            return <div key={enq.id} style={{background:enq.status==="Pending"?`${C.amber}10`:C.navyLight,border:`1px solid ${enq.status==="Pending"?C.amber+"44":C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:10,padding:"13px 15px",marginBottom:10}}>

              {/* Enquiry summary */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontSize:13,fontWeight:800,color:C.navy}}>{enq.agentName}</span>
                    <span style={{fontSize:10,background:`${sc}22`,color:sc,padding:"2px 8px",borderRadius:10,fontWeight:700}}>{enq.status}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"auto auto",gap:"3px 14px",fontSize:11,color:C.muted}}>
                    <span>{enq.startDate===enq.endDate?enq.startDate:`${enq.startDate} → ${enq.endDate}`}{nights>0&&` (${nights}n)`}</span>
                    <span>{enq.guests} guests</span>
                    <span>{enq.charterType}</span>
                    <span>{enq.agentEmail}</span>
                    {enq.agentPhone&&<span>{enq.agentPhone}</span>}
                  </div>
                  {enq.notes&&<div style={{fontSize:11,color:C.text,marginTop:6,fontStyle:"italic"}}>"{enq.notes}"</div>}
                  {enq.captainResponse&&<div style={{fontSize:11,color:sc,marginTop:5,padding:"5px 8px",background:`${sc}12`,borderRadius:5}}>Your response: {enq.captainResponse}</div>}
                  {enq.moreInfoThread?.map((t,i)=>(
                    <div key={i} style={{fontSize:11,color:"#9b59b6",marginTop:4,padding:"4px 8px",background:"#9b59b612",borderRadius:5}}>💬 {t.text}</div>
                  ))}
                  <div style={{fontSize:9,color:C.muted,marginTop:5}}>Submitted {enq.submittedAt}{enq.respondedAt&&` · Responded ${enq.respondedAt}`}</div>
                </div>
              </div>

              {/* Captain action buttons — only for pending */}
              {enq.status==="Pending"&&<div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:4}}>
                <button onClick={()=>respondEnquiry(enq.id,"Accepted","Thank you for your enquiry. We are pleased to confirm availability for your requested dates. We will be in touch shortly with the charter agreement.")}
                  style={{...btn,background:C.greenL+"22",color:C.greenL,border:`1px solid ${C.greenL}44`,padding:"6px 14px",fontSize:12,fontWeight:700}}>
                  {"✓ Accept"}
                </button>
                <button onClick={()=>respondEnquiry(enq.id,"Declined","Thank you for your enquiry. Unfortunately we are unable to accommodate your requested dates at this time. Please feel free to enquire about alternative dates.")}
                  style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"6px 14px",fontSize:12,fontWeight:700}}>
                  {"✕ Decline"}
                </button>
                <button onClick={()=>setMoreInfoId(isOpen?null:enq.id)}
                  style={{...btn,background:"#9b59b622",color:"#9b59b6",border:"1px solid #9b59b644",padding:"6px 14px",fontSize:12,fontWeight:700}}>
                  {"💬 More Info"}
                </button>
              </div>}

              {/* More info reply box */}
              {isOpen&&<div style={{marginTop:9,paddingTop:9,borderTop:`1px solid #9b59b633`}}>
                <textarea value={moreInfoText} onChange={e=>setMoreInfoText(e.target.value)}
                  placeholder="Ask the agent for additional details…"
                  rows={2} style={{...inp,width:"100%",padding:"8px 10px",fontSize:12,resize:"vertical",lineHeight:1.5,marginBottom:7}}/>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>{setMoreInfoId(null);setMoreInfoText("");}} style={{...btn,flex:1,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"6px 0",fontSize:11}}>Cancel</button>
                  <button onClick={()=>sendMoreInfo(enq.id)} disabled={!moreInfoText.trim()}
                    style={{...btn,flex:2,background:"#9b59b6",color:C.white,padding:"6px 0",fontSize:12,fontWeight:700,opacity:moreInfoText.trim()?1:.5}}>
                    {"💬 Send & Email Agent"}
                  </button>
                </div>
              </div>}
            </div>;
          })}
        </div>
      </div>
    </div>}

    {/* ── UNIVERSAL ENTRY DETAIL POPUP ── */}
    {/* Multi-entry popup — shown when a date has 2+ events */}
    {multiDetail&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={()=>setMultiDetail(null)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px 16px 0 0",width:"min(520px,100%)",padding:"20px 18px 36px",maxHeight:"70vh",overflowY:"auto",WebkitOverflowScrolling:"touch"}}
        onClick={e=>e.stopPropagation()}
        >
        {/* Handle bar — tall touch zone, × button */}
        <div
          onTouchStart={e=>{e.currentTarget.dataset.sy=e.touches[0].clientY;}}
          onTouchEnd={e=>{if(e.changedTouches[0].clientY - Number(e.currentTarget.dataset.sy||0) > 60) setMultiDetail(null);}}
          style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,position:"relative",padding:"12px 0",cursor:"grab",touchAction:"none"}}>
          <div style={{width:44,height:5,background:C.muted+"88",borderRadius:3}}/>
          <button onClick={()=>setMultiDetail(null)} style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.muted,fontSize:24,cursor:"pointer",lineHeight:1,padding:"4px 8px"}}>{"×"}</button>
        </div>
        <div style={{fontSize:13,fontWeight:800,color:C.navy,marginBottom:14}}>
          {multiDetail.dateStr} — {multiDetail.entries.length} events
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {multiDetail.entries.map(entry=>{
            const t = AVAIL_TYPES[entry.type]||AVAIL_TYPES.Unavailable;
            const nights = Math.max(0,Math.round((new Date(entry.end)-new Date(entry.start))/(1000*60*60*24)));
            return (
              <div key={entry.id}
                onClick={()=>{setMultiDetail(null);setDetailEntry(entry);}}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:t.bg,border:`1px solid ${t.border}`,borderRadius:10,cursor:"pointer"}}>
                <div style={{flexShrink:0}}><Ico i={t.IconC||Calendar} s={22} c={t.color}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{entry.title||entry.type}</div>
                  <div style={{fontSize:11,color:t.color,fontWeight:600}}>{entry.type}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:1}}>{entry.start}{nights>0?` → ${entry.end} (${nights} night${nights!==1?"s":""})`:""}{entry.startTime?` · ${entry.startTime}–${entry.endTime}`:""}</div>
                </div>
                <span style={{fontSize:16,color:C.muted}}>›</span>
              </div>
            );
          })}
        </div>
        {canEdit&&<button onClick={()=>{setMultiDetail(null);openNew(multiDetail.dateStr);}}
          style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,width:"100%",padding:"10px 0",marginTop:14,fontSize:12}}>
          {"+ Add New Entry on This Date"}
        </button>}
      </div>
    </div>}

    {detailEntry&&detailEntry.type!=="Booked"&&<EntryDetailPopup
      entry={detailEntry}
      role={role}
      onClose={()=>{setDetailEntry(null);setMultiDetail(null);}}
      onEdit={()=>{openEdit(detailEntry); setDetailEntry(null);}}
      onGoToLeave={()=>setView("leave")}
      onOpenCharter={()=>{}}
    />}

    {/* ── CHARTER DETAIL PAGE (Booked entries) ── */}
    {(charterDetailEntry||(detailEntry?.type==="Booked"&&detailEntry))&&<CharterDetailPage
      entry={charterDetailEntry||detailEntry}
      role={role}
      onClose={()=>{setCharterDetailEntry(null);setDetailEntry(null);}}
      onEdit={()=>{const e=charterDetailEntry||detailEntry; openEdit(e); setCharterDetailEntry(null); setDetailEntry(null);}}
      onUpload={()=>{ const e=charterDetailEntry||detailEntry; setDocUploaderEntry(e); setShowDocUploader(true); }}
    />}

    {/* ── CHARTER DOC UPLOADER ── */}
    {showDocUploader&&docUploaderEntry&&<CharterDocUploader
      charterDetails={docUploaderEntry.charterDetails}
      entryTitle={docUploaderEntry.title}
      tasks={tasks}
      setTasks={setTasks}
      role={role}
      onUpdate={mergedDetails=>{
        const updated = {...docUploaderEntry, charterDetails: mergedDetails};
        setCalEntries(p=>p.map(e=>e.id===docUploaderEntry.id ? updated : e));
        setDocUploaderEntry(updated);
        setCharterDetailEntry(updated);
        logC("Charter Doc Uploaded", `${docUploaderEntry.title} — AI extraction published`);
      }}
      onClose={()=>{ setShowDocUploader(false); setDocUploaderEntry(null); }}
    />}

    {/* ── FORM MODAL — never shown to agents or on vessel/rules tab ── */}
    {showForm&&!isAgent&&viewMode!=="vessel"&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:600,padding:"16px 16px 40px",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={()=>{setShowForm(false);setShowInlineUploader(false);setInlineUploadError(null);}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:480,maxWidth:"96vw",padding:24,marginTop:8}} onClick={e=>e.stopPropagation()}>

        {/* Modal header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:16,fontWeight:800,color:C.navy}}>{editEntry?"Edit Entry":"New Calendar Entry"}</div>
          <button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:24,padding:0,lineHeight:1}}>×</button>
        </div>

        {/* Availability type selector */}
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Entry Type</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
          {Object.entries(AVAIL_TYPES)
            .filter(([type])=>!["Available","Crew Leave"].includes(type))
            .map(([type,t])=>(
            <button key={type} onClick={()=>setForm(p=>({...p,type}))}
              style={{...btn,background:form.type===type?t.bg:C.navyLight,
                color:form.type===type?t.color:C.muted,
                border:`2px solid ${form.type===type?t.color:C.border}`,
                padding:"9px 12px",textAlign:"left",display:"flex",alignItems:"center",gap:7,fontWeight:form.type===type?700:400}}>
              <Ico i={t.IconC||Calendar} s={16} c={t.color}/>
              <span style={{fontSize:12}}>{type}</span>
            </button>
          ))}
        </div>
        {/* Type explanations */}
        {form.type==="Hold"&&<div style={{background:AVAIL_TYPES.Hold.bg,border:`1px solid ${AVAIL_TYPES.Hold.border}`,borderRadius:7,padding:"7px 11px",marginBottom:12,fontSize:11,color:AVAIL_TYPES.Hold.color}}>
          {"Hold — awaiting payment or confirmation. Agents see this as \"Enquire Only\". Release when charter confirms or falls through."}
        </div>}
        {form.type==="Enquire Only"&&<div style={{background:AVAIL_TYPES["Enquire Only"].bg,border:`1px solid ${AVAIL_TYPES["Enquire Only"].border}`,borderRadius:7,padding:"7px 11px",marginBottom:12,fontSize:11,color:AVAIL_TYPES["Enquire Only"].color}}>
          {"Enquire Only — dates may be available but require captain confirmation first."}
        </div>}

        {/* Title */}
        <div style={{marginBottom:13}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Title</div>
          <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
            placeholder={`e.g. ${AVAIL_TYPES[form.type]?.label} — Charter name, owner trip…`}
            style={{...inp,width:"100%",padding:"9px 12px",fontSize:13}}/>
        </div>

        {/* Dates + Times */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Start Date</div>
            <input type="date" value={form.start} onChange={e=>setForm(p=>({...p,start:e.target.value,end:e.target.value>p.end?e.target.value:p.end}))}
              style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>End Date</div>
            <input type="date" value={form.end} min={form.start} onChange={e=>setForm(p=>({...p,end:e.target.value}))}
              style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Start Time</div>
            <input type="time" value={form.startTime} onChange={e=>setForm(p=>({...p,startTime:e.target.value}))}
              style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>End Time</div>
            <input type="time" value={form.endTime} onChange={e=>setForm(p=>({...p,endTime:e.target.value}))}
              style={{...inp,width:"100%",padding:"8px 10px",fontSize:12}}/>
          </div>
        </div>

        {/* Duration preview */}
        {form.start&&form.end&&<div style={{background:C.navyLight,borderRadius:7,padding:"7px 12px",marginBottom:13,fontSize:11,color:C.muted,display:"flex",gap:10}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}>{AVAIL_TYPES[form.type]?.IconC&&<Ico i={AVAIL_TYPES[form.type].IconC} s={12} c={AVAIL_TYPES[form.type].color}/>}{form.type}</span>
          <span>·</span>
          <span style={{color:C.text}}>{form.start===form.end?"Same day":`${Math.round((new Date(form.end)-new Date(form.start))/(1000*60*60*24))} nights`}</span>
          <span>·</span>
          <span>{form.startTime} → {form.endTime}</span>
        </div>}

        {/* Rule warnings */}
        {(()=>{
          const warns = getFormWarnings();
          if(!warns.length) return null;
          return <div style={{marginBottom:13}}>
            {warns.map((w,i)=>{
              const col = w.severity==="block"?C.signal:w.severity==="warn"?C.amber:"#6b8cba";
              const icon= w.severity==="block"?"⛔":w.severity==="warn"?"⚠️":"👑";
              return <div key={i} style={{background:`${col}12`,border:`1px solid ${col}44`,borderRadius:7,padding:"7px 11px",marginBottom:4,fontSize:11,color:col,display:"flex",alignItems:"flex-start",gap:7}}>
                <span style={{flexShrink:0}}>{icon}</span>
                <span style={{lineHeight:1.4}}>{w.label}</span>
              </div>;
            })}
          </div>;
        })()}

        {/* Charter Details — captain/management only when type is Booked */}
        {form.type==="Booked"&&canEdit&&<div style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1}}>Charter Details</div>
            <button onClick={()=>{setShowInlineUploader(p=>!p);setInlineUploadError(null);}}
              style={{...btn,background:showInlineUploader?C.brass+"33":C.navyLight,color:showInlineUploader?C.brass:C.muted,
                border:`1px solid ${showInlineUploader?C.brass+"66":C.border}`,padding:"3px 10px",fontSize:10,display:"flex",alignItems:"center",gap:5}}>
              {"Upload Preference Sheet"}
            </button>
          </div>
          {/* Inline uploader — runs AI extraction and populates form.charterDetails */}
          {showInlineUploader&&<div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:9,padding:"12px 14px",marginBottom:10}}>
            {inlineUploading
              ? <div style={{textAlign:"center",padding:"14px 0"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Ico i={Bot} s={22} c={C.brass}/></div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>AI extracting preference data…</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:3}}>This takes a few seconds</div>
                </div>
              : <>
                  <div style={{fontSize:11,color:C.text,marginBottom:8,lineHeight:1.5}}>
                    Upload a guest preference sheet — AI will extract and fill in all charter details below automatically.
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <input ref={inlineFileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{display:"none"}}
                      onChange={e=>runInlineExtraction(e.target.files[0])}/>
                    <button onClick={()=>inlineFileRef.current?.click()}
                      style={{...btn,background:C.brass,color:C.bg,padding:"7px 16px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                      {"Choose File"}
                    </button>
                    <span style={{fontSize:10,color:C.muted}}>PDF, Word (.docx) or text — max 10 MB</span>
                  </div>
                  {inlineUploadError&&<div style={{marginTop:8,fontSize:11,color:C.signal}}>{inlineUploadError}</div>}
                  <div style={{marginTop:10,fontSize:10,color:C.muted,lineHeight:1.5}}>
                    You can also fill in details manually below, or upload a file later from the charter detail view.
                  </div>
                </>
            }
          </div>}
          <div style={{background:C.navyLight,borderRadius:8,padding:"12px 14px",maxHeight:"40vh",overflowY:"auto"}}>
            {(()=>{
              const cd = form.charterDetails||{...EMPTY_CHARTER_DETAILS};
              const upd = patch => setForm(p=>({...p,charterDetails:{...(p.charterDetails||EMPTY_CHARTER_DETAILS),...patch}}));
              const Fld2 = ({label, k, ph, multi}) => <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>{label}</div>
                {multi
                  ? <textarea value={cd[k]||""} onChange={e=>upd({[k]:e.target.value})} placeholder={ph||""} rows={2}
                      style={{...inp,width:"100%",padding:"5px 8px",fontSize:11,resize:"vertical",lineHeight:1.5}}/>
                  : <input value={cd[k]||""} onChange={e=>upd({[k]:e.target.value})} placeholder={ph||""}
                      style={{...inp,width:"100%",padding:"5px 8px",fontSize:11}}/>}
              </div>;
              const SubHd = ({label})=><div style={{fontSize:9,color:C.brass,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,margin:"10px 0 6px"}}>{label}</div>;
              return <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
                  <Fld2 label="Charter type" k="charterType" ph="Day / Weekly…"/>
                  <Fld2 label="Guest count" k="guestCount" ph="6"/>
                </div>
                <Fld2 label="Guest notes" k="guestNotes" ph="Who are the guests?" multi/>
                <Fld2 label="Occasion" k="occasion" ph="Birthday / Corporate…"/>
                <SubHd label="Arrival & Departure"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
                  <Fld2 label="Arrival time" k="arrivalTime" ph="10:00"/>
                  <Fld2 label="Arrival location" k="arrivalLocation" ph="Dubai Marina"/>
                  <Fld2 label="Arrival from" k="arrivalFrom" ph="London, UK"/>
                  <Fld2 label="Departure time" k="departureTime" ph="18:00"/>
                  <Fld2 label="Departure location" k="departureLocation" ph=""/>
                </div>
                <Fld2 label="Arrival notes" k="arrivalNotes" ph="Transfer, contact number…" multi/>
                <Fld2 label="Departure notes" k="departureNotes" ph="Return transfer details…" multi/>
                <SubHd label="Guest Requirements (Stew)"/>
                <Fld2 label="VIP guests" k="vipGuests" ph="VIP names / protocol"/>
                <Fld2 label="Special requests" k="specialRequests" ph="Snorkelling, sunset dinner…" multi/>
                <Fld2 label="Cabin assignments" k="cabinAssignments" ph="Master: Guest A…"/>
                <Fld2 label="Cabin preferences" k="cabinPreferences" ph="A/C temp, pillow type, blackout blinds…" multi/>
                <SubHd label="Drinks (Stew)"/>
                <Fld2 label="Drink preferences" k="drinkPreferences" ph="Wine, no alcohol…"/>
                <Fld2 label="Wine / champagne" k="winePreferences" ph="Sauvignon Blanc, Perrier-Jouët…"/>
                <Fld2 label="Soft drinks / water" k="softDrinkPrefs" ph="Perrier, fresh juices, Coke…"/>
                <SubHd label="Dietary (Chef)"/>
                <Fld2 label="Allergies" k="allergies" ph="None / list allergies"/>
                <Fld2 label="Dietary requirements" k="dietaryReqs" ph="Halal, vegetarian…"/>
                <Fld2 label="Meal preferences" k="mealPreferences" ph="Cuisine style…"/>
                <Fld2 label="Specific meal requests" k="mealRequests" ph="BBQ lunch Day 3, formal dinner…" multi/>
                <Fld2 label="Per-guest food preferences" k="guestFoodPrefs" ph="Guest A: no fish. Guest B: vegan…" multi/>
                <SubHd label="Deck & Watersports"/>
                <Fld2 label="General watersports" k="watersportsReqs" ph="General watersports note…"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
                  <Fld2 label="Jet Ski" k="jetSkiReqs" ph="Day 2 PM, 2 riders…"/>
                  <Fld2 label="Seabob" k="seabobReqs" ph="Day 3, snorkelling trip…"/>
                  <Fld2 label="E-Foil" k="efoilReqs" ph="Optional Day 4…"/>
                  <Fld2 label="Tender ops" k="tenderOps" ph="Beach transfer Day 4…"/>
                </div>
                <Fld2 label="Beach setup" k="beachSetupReqs" ph="Umbrella, loungers, cool box, floating mat…" multi/>
                <SubHd label="Engineering & Technical"/>
                <Fld2 label="Fuel required" k="fuelRequired" ph="Approx litres"/>
                <Fld2 label="Engine / tech notes" k="engineNotes" ph="Night anchoring, generator…"/>
                <Fld2 label="Power requirements" k="powerReqs" ph="Shore power, generator schedule…"/>
                <Fld2 label="Equipment requests" k="equipmentReqs" ph="Satellite phone, PA system…" multi/>
                <SubHd label="Internal (Captain only)"/>
                <Fld2 label="Agent name" k="agentName" ph="Gulf Coast / Direct"/>
                <Fld2 label="Agent contact" k="agentContact" ph="Email / phone"/>
                <Fld2 label="Internal notes" k="internalNotes" ph="Commission, payment…" multi/>
              </>;
            })()}
          </div>
        </div>}

        {/* Notes */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Notes (optional)</div>
          <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
            placeholder="Guest info, charter details, maintenance spec, crew notes…"
            rows={3} style={{...inp,width:"100%",padding:"9px 12px",fontSize:12,resize:"vertical",lineHeight:1.5}}/>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:9}}>
          {editEntry&&canEdit&&<button onClick={()=>del(editEntry.id)}
            style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"9px 14px"}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}><Trash2 size={13} strokeWidth={2}/>Delete</span>
          </button>}
          <button onClick={()=>setShowForm(false)} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"9px 0"}}>Cancel</button>
          <button onClick={save} disabled={!form.title.trim()||!form.start||!form.end}
            style={{...btn,flex:2,background:AVAIL_TYPES[form.type]?.color||C.brass,color:form.type==="Available"||form.type==="Booked"?C.bg:C.white,
              padding:"9px 0",fontWeight:700,opacity:form.title.trim()?1:.5}}>
            {editEntry?"Save Changes":"Add to Calendar"}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG MODULE
// ═══════════════════════════════════════════════════════════════
const AUDIT_MODULES = ["All","Tasks","Crew","Documents","General"];
const AUDIT_ACTIONS = ["All","Task Assigned","Task Completed","Task Approved","Task Deleted","Task Reassigned","Task Started","Task Submitted","Crew Added","Crew Updated","Crew Deleted","Document Added","Document Updated","Document Deleted","Crew Doc Added","Crew Doc Deleted"];

function AuditModule({auditLog,role}) {
  const [search,setSearch]       = useState("");
  const [modFilter,setModFilter] = useState("All");
  const [actFilter,setActFilter] = useState("All");
  const [userFilter,setUserFilter]= useState("All");

  const users=["All",...new Set(auditLog.map(e=>e.user))];

  const visible=auditLog.filter(e=>{
    if(modFilter!=="All"&&e.module!==modFilter) return false;
    if(actFilter!=="All"&&e.action!==actFilter) return false;
    if(userFilter!=="All"&&e.user!==userFilter) return false;
    if(search&&!e.detail.toLowerCase().includes(search.toLowerCase())&&!e.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const moduleColor={Tasks:C.blue,Crew:C.purple,Documents:C.amber,General:C.muted};
  const actionIcon={
    "Task Assigned":"›","Task Completed":"✓","Task Approved":"✓","Task Deleted":"×",
    "Task Reassigned":"↔","Task Started":"▶","Task Submitted":"…",
    "Crew Added":"+","Crew Updated":"✎","Crew Deleted":"×",
    "Document Added":"+","Document Updated":"✎","Document Deleted":"×",
    "Crew Doc Added":"+","Crew Doc Deleted":"×",
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Audit Log <span style={{color:C.muted,fontSize:14,fontWeight:400}}>({visible.length} entries)</span></div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>All system actions — who did what and when</div>
      </div>
    </div>

    {/* Summary stats */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
      {[["Tasks",C.blue],["Crew",C.purple],["Documents",C.amber]].map(([mod,col])=>{
        const count=auditLog.filter(e=>e.module===mod).length;
        return <div key={mod} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 16px",flex:1,minWidth:100,cursor:"pointer"}}
          onClick={()=>setModFilter(mod==="All"?modFilter:mod)}>
          <div style={{fontSize:20,fontWeight:800,color:col,fontFamily:"monospace"}}>{count}</div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{mod} actions</div>
        </div>;
      })}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 16px",flex:1,minWidth:100}}>
        <div style={{fontSize:20,fontWeight:800,color:C.navy,fontFamily:"monospace"}}>{new Set(auditLog.map(e=>e.user)).size}</div>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>Active Users</div>
      </div>
    </div>

    {/* Filters */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search actions…"
        style={{...inp,width:200,padding:"6px 10px",fontSize:12}}/>
      <select value={modFilter} onChange={e=>setModFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        {AUDIT_MODULES.map(m=><option key={m}>{m}</option>)}
      </select>
      <select value={userFilter} onChange={e=>setUserFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        {users.map(u=><option key={u}>{u}</option>)}
      </select>
      <select value={actFilter} onChange={e=>setActFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        {AUDIT_ACTIONS.map(a=><option key={a}>{a}</option>)}
      </select>
      {(search||modFilter!=="All"||actFilter!=="All"||userFilter!=="All")&&
        <button onClick={()=>{setSearch("");setModFilter("All");setActFilter("All");setUserFilter("All");}}
          style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear</button>}
    </div>

    {/* Log entries */}
    {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Search} s={28} c={C.muted}/></div>No entries match this filter.
    </div>}

    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {visible.map((entry,i)=>{
        const modCol=moduleColor[entry.module]||C.muted;
        const icon=actionIcon[entry.action]||"•";
        return <div key={entry.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${modCol}`,borderRadius:8,padding:"10px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{fontSize:16,flexShrink:0,marginTop:1}}>{icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:3,alignItems:"center"}}>
              <Pill label={entry.module} bg={modCol+"22"} color={modCol} small/>
              <Pill label={entry.action} bg={C.navyLight} color={C.muted} small/>
            </div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.4}}>{entry.detail}</div>
          </div>
          <div style={{flexShrink:0,textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{entry.user}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{entry.role}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2,fontFamily:"monospace"}}>{entry.timestamp}</div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}



// ═══════════════════════════════════════════════════════════════
// PHASE 3 — MAINTENANCE MODULE
// ═══════════════════════════════════════════════════════════════

const ASSET_CATS = ["Propulsion","Electrical","Systems","HVAC","Tender","Water Toys","Navigation","Safety","Hydraulics"];

const d3 = n => { const dt=new Date(); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };

const INIT_ASSETS = [
  {id:"a1",name:"Starboard Engine",category:"Propulsion",manufacturer:"Volvo Penta",model:"D13-S IPS",serial:"VP-0044-2021",installedDate:"2021-03-15",currentHours:2847,serviceIntervalHours:250,lastServiceHours:2750,lastServiceDate:"2026-04-10",notes:"Running well. Next service at 3000hrs.",photos:[],history:[
    {id:"h1",date:"2026-04-10",type:"Service",desc:"250hr service — oil, filters, impeller replaced",technician:"Chief Engineer",hours:4,parts:"Oil filter x1, Impeller kit"},
    {id:"h2",date:"2025-11-20",type:"Service",desc:"250hr service — full service completed",technician:"Chief Engineer",hours:3.5,parts:"Oil filter, fuel filter"},
  ]},
  {id:"a2",name:"Port Engine",category:"Propulsion",manufacturer:"Volvo Penta",model:"D13-S IPS",serial:"VP-0045-2021",installedDate:"2021-03-15",currentHours:2831,serviceIntervalHours:250,lastServiceHours:2750,lastServiceDate:"2026-04-10",notes:"",photos:[],history:[
    {id:"h3",date:"2026-04-10",type:"Service",desc:"250hr service completed",technician:"Chief Engineer",hours:4,parts:"Oil filter x1, Impeller kit"},
  ]},
  {id:"a3",name:"Generator #1",category:"Electrical",manufacturer:"Northern Lights",model:"M843LW3",serial:"NL-G1-2020",installedDate:"2020-09-01",currentHours:1247,serviceIntervalHours:250,lastServiceHours:1000,lastServiceDate:"2026-02-18",notes:"SERVICE OVERDUE — schedule immediately.",photos:[],history:[
    {id:"h4",date:"2026-02-18",type:"Service",desc:"1000hr service — oil, filters, belts checked",technician:"Chief Engineer",hours:5,parts:"Oil filter, air filter, belt"},
  ]},
  {id:"a4",name:"Generator #2",category:"Electrical",manufacturer:"Northern Lights",model:"M843LW3",serial:"NL-G2-2020",installedDate:"2020-09-01",currentHours:1104,serviceIntervalHours:250,lastServiceHours:1000,lastServiceDate:"2026-02-18",notes:"",photos:[],history:[
    {id:"h5",date:"2026-02-18",type:"Service",desc:"1000hr service completed",technician:"Chief Engineer",hours:4.5,parts:"Oil filter, air filter"},
  ]},
  {id:"a5",name:"Watermaker",category:"Systems",manufacturer:"Spectra",model:"Newport 400C",serial:"SP-W-2021",installedDate:"2021-05-20",currentHours:890,serviceIntervalHours:500,lastServiceHours:750,lastServiceDate:"2025-11-30",notes:"Output 380L/hr — slightly below spec. Monitor.",photos:[],history:[
    {id:"h6",date:"2025-11-30",type:"Service",desc:"Filter replacement and membrane check",technician:"Chief Engineer",hours:2,parts:"Pre-filter x3"},
  ]},
  {id:"a6",name:"AC System — Main Deck",category:"HVAC",manufacturer:"Webasto",model:"FCF Platinum",serial:"WB-AC-01",installedDate:"2021-03-15",currentHours:0,serviceIntervalHours:0,lastServiceHours:0,lastServiceDate:"2026-01-10",notes:"Calendar-based service — annually.",photos:[],history:[]},
  {id:"a7",name:"Tender — Williams Jet",category:"Tender",manufacturer:"Williams",model:"Jet Tender 325",serial:"WJ-T-2022",installedDate:"2022-07-01",currentHours:312,serviceIntervalHours:100,lastServiceHours:300,lastServiceDate:"2026-05-15",notes:"",photos:[],history:[
    {id:"h7",date:"2026-05-15",type:"Service",desc:"100hr service — impeller, spark plugs, flush",technician:"Deckhand",hours:3,parts:"Impeller, spark plugs x2"},
  ]},
  {id:"a8",name:"Jet Ski #1",category:"Water Toys",manufacturer:"Sea-Doo",model:"GTX 230",serial:"SD-JS-001",installedDate:"2022-07-01",currentHours:148,serviceIntervalHours:50,lastServiceHours:100,lastServiceDate:"2025-12-01",notes:"SERVICE OVERDUE — 48hrs past interval.",photos:[],history:[
    {id:"h8",date:"2025-12-01",type:"Service",desc:"100hr service completed",technician:"Deckhand",hours:2,parts:"Spark plugs, impeller"},
  ]},
  {id:"a9",name:"Navigation — ECDIS & Radar",category:"Navigation",manufacturer:"Furuno",model:"NavNet TZtouch3",serial:"FU-NN-2021",installedDate:"2021-03-15",currentHours:0,serviceIntervalHours:0,lastServiceHours:0,lastServiceDate:"2025-09-01",notes:"Annual certification due Sept 2026.",photos:[],history:[]},
  {id:"a10",name:"Stabilisers",category:"Hydraulics",manufacturer:"Seakeeper",model:"SK16",serial:"SK-16-2021",installedDate:"2021-03-15",currentHours:1820,serviceIntervalHours:500,lastServiceHours:1500,lastServiceDate:"2025-08-20",notes:"",photos:[],history:[]},
];

const INIT_JOBS = [
  {id:"JC-001",assetId:"a3",title:"Generator #1 — 250hr service",desc:"Full 250hr service including oil, filters, impeller, belt inspection",priority:"Critical",status:"Pending",assignedTo:"engineer",createdDate:d3(-3),scheduledDate:d3(2),completedDate:null,checklist:[
    {id:"c1",text:"Drain and replace engine oil",done:false},
    {id:"c2",text:"Replace oil filter",done:false},
    {id:"c3",text:"Inspect and replace impeller if worn",done:false},
    {id:"c4",text:"Check coolant level and condition",done:false},
    {id:"c5",text:"Inspect belts — replace if cracked",done:false},
    {id:"c6",text:"Check exhaust system",done:false},
    {id:"c7",text:"Test run under load — log output",done:false},
    {id:"c8",text:"Record new hours in engine log",done:false},
  ],partsUsed:[],hoursWorked:0,notes:"",photos:{before:[],after:[]},signedOffBy:null},
  {id:"JC-002",assetId:"a8",title:"Jet Ski #1 — overdue 50hr service",desc:"50hr service overdue by approx 48 hours. Inspect impeller, plugs, flush.",priority:"High",status:"In Progress",assignedTo:"deckhand",createdDate:d3(-5),scheduledDate:d3(-2),completedDate:null,checklist:[
    {id:"c9",text:"Fresh water engine flush",done:true},
    {id:"c10",text:"Replace spark plugs",done:true},
    {id:"c11",text:"Inspect impeller — replace if worn",done:false},
    {id:"c12",text:"Check hull for damage",done:false},
    {id:"c13",text:"Test run and log",done:false},
  ],partsUsed:["Spark plugs x2"],hoursWorked:1.5,notes:"Plugs replaced. Impeller being sourced.",photos:{before:[],after:[]},signedOffBy:null},
  {id:"JC-003",assetId:"a1",title:"Starboard Engine — annual inspection",desc:"Full annual engine inspection and log",priority:"Medium",status:"Done",assignedTo:"engineer",createdDate:d3(-30),scheduledDate:d3(-20),completedDate:d3(-18),checklist:[
    {id:"c14",text:"Full visual inspection",done:true},
    {id:"c15",text:"Check all fluid levels",done:true},
    {id:"c16",text:"Inspect belts and hoses",done:true},
    {id:"c17",text:"Check mounts and alignment",done:true},
  ],partsUsed:["Hose clamps x4"],hoursWorked:3,notes:"All good. Minor hose clamp replacement.",photos:{before:[],after:[]},signedOffBy:"captain"},
];

// ── Asset status helpers ─────────────────────────────────────
function assetServiceStatus(asset) {
  if(!asset.serviceIntervalHours) return "Calendar";
  const hoursUsed = asset.currentHours - asset.lastServiceHours;
  const rem = asset.serviceIntervalHours - hoursUsed;
  if(rem <= 0)  return "Overdue";
  if(rem <= 50) return "Due Soon";
  return "Good";
}

function hoursUntilService(asset) {
  if(!asset.serviceIntervalHours) return null;
  return asset.serviceIntervalHours - (asset.currentHours - asset.lastServiceHours);
}

function assetStatusColor(status) {
  if(status==="Overdue")  return C.signal;
  if(status==="Due Soon") return C.amber;
  if(status==="Good")     return C.greenL;
  return C.muted;
}

// ── MAINTENANCE MODULE ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
// AI SERVICE SCHEDULER
// ═══════════════════════════════════════════════════════════════
// ── CAPTAIN BULK EXPORT PANEL ─────────────────────────────────
function CaptainExportPanel({crew, hoursLog, leaveRequests, vessel, captain, watchkeeper, MONTH_NAMES, toMins, buildMonthPage, openExport}) {
  const now = new Date();
  const crewList = crew.filter(c=>!["owner","management","agent"].includes(c.role));

  const [selCrew,  setSelCrew]  = useState(crewList.map(c=>c.id));   // all selected by default
  const [fromYear, setFromYear] = useState(now.getFullYear());
  const [fromMonth,setFromMonth]= useState(now.getMonth());
  const [toYear,   setToYear]   = useState(now.getFullYear());
  const [toMonth,  setToMonth]  = useState(now.getMonth());
  const [exporting,setExporting]= useState(false);

  const YEARS = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1];

  // Build ordered list of {year,month} between from and to inclusive
  function monthRange() {
    const months=[];
    let y=fromYear, m=fromMonth;
    while(y<toYear||(y===toYear&&m<=toMonth)){
      months.push({year:y,month:m});
      m++; if(m>11){m=0;y++;}
      if(months.length>24) break; // safety cap 2 years
    }
    return months;
  }

  function toggleCrew(id){ setSelCrew(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]); }

  function generate() {
    if(!selCrew.length) return;
    setExporting(true);
    const range = monthRange();
    if(!range.length){ setExporting(false); return; }
    // Build pages: for each crew member, for each month
    const pages=[];
    crewList.filter(c=>selCrew.includes(c.id)).forEach(crewMember=>{
      range.forEach(({year,month})=>{
        pages.push({crewMember, year, month});
      });
    });
    const crewLabel = crewList.filter(c=>selCrew.includes(c.id)).map(c=>c.name).join(", ");
    const rangeLabel = range.length===1
      ? `${MONTH_NAMES[range[0].month]} ${range[0].year}`
      : `${MONTH_NAMES[range[0].month]} ${range[0].year} to ${MONTH_NAMES[range[range.length-1].month]} ${range[range.length-1].year}`;
    const filename = `Crew Hours — ${crewLabel} — ${rangeLabel}`;
    setTimeout(()=>{ openExport(pages, filename); setExporting(false); }, 50);
  }

  const range = monthRange();
  const pageCount = selCrew.length * range.length;

  return <div style={{marginTop:20,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
    {/* Header */}
    <div style={{background:C.navy,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
      <Ico i={FileText} s={18} c={C.brassL}/>
      <div>
        <div style={{fontSize:14,fontWeight:800,color:C.white}}>Captain — Bulk Export</div>
        <div style={{fontSize:10,color:C.brassL+"aa"}}>Export multiple crew · multiple months · one file</div>
      </div>
    </div>

    <div style={{padding:"14px 16px"}}>
      {/* Crew selection */}
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:8}}>Select crew members</div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
        <button onClick={()=>setSelCrew(crewList.map(c=>c.id))}
          style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:10}}>All</button>
        <button onClick={()=>setSelCrew([])}
          style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:10}}>None</button>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {crewList.map(c=>(
          <button key={c.id} onClick={()=>toggleCrew(c.id)}
            style={{...btn,padding:"8px 14px",fontSize:12,fontWeight:selCrew.includes(c.id)?700:400,
              background:selCrew.includes(c.id)?C.navy:C.navyLight,
              color:selCrew.includes(c.id)?C.white:C.text,
              border:`1px solid ${selCrew.includes(c.id)?C.navy:C.border}`,borderRadius:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <RoleIcon role={c.role} size={12} color={selCrew.includes(c.id)?C.brassL:C.muted}/>
              {c.name.split(" ")[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Month range */}
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:8}}>Date range</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:14}}>
        {/* From */}
        <div style={{background:C.navyLight,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.6}}>From</div>
          <div style={{display:"flex",gap:6}}>
            <select value={fromMonth} onChange={e=>setFromMonth(Number(e.target.value))}
              style={{...inp,flex:1,padding:"6px 8px",fontSize:12}}>
              {MONTH_NAMES.map((m,i)=><option key={i} value={i}>{m.slice(0,3)}</option>)}
            </select>
            <select value={fromYear} onChange={e=>setFromYear(Number(e.target.value))}
              style={{...inp,width:70,padding:"6px 8px",fontSize:12}}>
              {YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{textAlign:"center",color:C.muted,fontSize:16}}>→</div>
        {/* To */}
        <div style={{background:C.navyLight,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.6}}>To</div>
          <div style={{display:"flex",gap:6}}>
            <select value={toMonth} onChange={e=>setToMonth(Number(e.target.value))}
              style={{...inp,flex:1,padding:"6px 8px",fontSize:12}}>
              {MONTH_NAMES.map((m,i)=><option key={i} value={i}>{m.slice(0,3)}</option>)}
            </select>
            <select value={toYear} onChange={e=>setToYear(Number(e.target.value))}
              style={{...inp,width:70,padding:"6px 8px",fontSize:12}}>
              {YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Quick range presets */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
        {[
          {label:"This month",  fn:()=>{setFromMonth(now.getMonth());setFromYear(now.getFullYear());setToMonth(now.getMonth());setToYear(now.getFullYear());}},
          {label:"Last 3 months",fn:()=>{const d=new Date(now.getFullYear(),now.getMonth()-2,1);setFromMonth(d.getMonth());setFromYear(d.getFullYear());setToMonth(now.getMonth());setToYear(now.getFullYear());}},
          {label:"Last 6 months",fn:()=>{const d=new Date(now.getFullYear(),now.getMonth()-5,1);setFromMonth(d.getMonth());setFromYear(d.getFullYear());setToMonth(now.getMonth());setToYear(now.getFullYear());}},
          {label:"Full year",   fn:()=>{setFromMonth(0);setFromYear(now.getFullYear());setToMonth(11);setToYear(now.getFullYear());}},
        ].map(({label,fn})=>(
          <button key={label} onClick={fn}
            style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 11px",fontSize:11}}>
            {label}
          </button>
        ))}
      </div>

      {/* Summary + generate */}
      <div style={{background:C.navyLight,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:C.text}}>
        {pageCount===0
          ? <span style={{color:C.signal}}>Select at least one crew member and a valid date range.</span>
          : <><b style={{color:C.navy}}>{pageCount} page{pageCount!==1?"s":""}</b>
              {" — "}{selCrew.length} crew member{selCrew.length!==1?"s":""}
              {" × "}{range.length} month{range.length!==1?"s":""}
              {range.length>0&&<span style={{color:C.muted}}> ({MONTH_NAMES[range[0].month].slice(0,3)} {range[0].year}{range.length>1?` → ${MONTH_NAMES[range[range.length-1].month].slice(0,3)} ${range[range.length-1].year}`:""})</span>}
            </>
        }
      </div>

      <button disabled={pageCount===0||exporting} onClick={generate}
        style={{...btn,width:"100%",background:pageCount>0?C.navy:C.navyLight,color:pageCount>0?C.white:C.muted,
          padding:"13px 0",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          opacity:pageCount===0?.5:1,transition:"all .15s"}}>
        <Ico i={Download} s={16} c={pageCount>0?C.brassL:C.muted}/>
        {exporting?"Generating…":`Generate ${pageCount} page report`}
      </button>
      <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:6}}>
        Downloads as .html — open in browser → Print → Save as PDF
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// MLC HOURS OF REST MODULE
// Tracks crew rest hours per day. Exports to exact Annex B PDF
// format as required by MLC 2006 / STCW surveyors.
// MLC minimums: ≥10 hrs rest in any 24h period; ≥77 hrs in any 7-day period
// ═══════════════════════════════════════════════════════════════
function HoursModule({hoursLog, setHoursLog, role, crew, vesselRegistry=[], leaveRequests=[], logAudit}) {
  const logH = (a,d) => logAudit&&logAudit(a,d,"Hours of Rest");
  const isAdmin = ["captain","management"].includes(role);
  const vessel  = vesselRegistry[0];
  const captain = crew.find(c=>c.role==="captain");

  const myCrew  = crew.find(c=>c.role===role);
  const [selCrewId, setSelCrewId] = useState(
    isAdmin ? (crew.find(c=>!["owner","management","agent"].includes(c.role))?.id||"") : myCrew?.id||""
  );
  const selCrew = crew.find(c=>c.id===selCrewId);

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [watchkeeper, setWatchkeeper] = useState({});
  const [expandDay,   setExpandDay]   = useState(null);
  const [exportHtml,  setExportHtml]  = useState(null);
  const [exportFilename, setExportFilename] = useState("");
  const iframeRef = useRef(null);

  // Close export modal on browser back (Android back button, iOS swipe, desktop)
  useEffect(()=>{
    if(!exportHtml) return;
    const onPop = ()=>setExportHtml(null);
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[exportHtml]);

  function prevMonth() { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); }
  function nextMonth() { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); }

  // ── DATA MODEL ─────────────────────────────────────────────────
  // Each day record: { crewId, date, workPeriods:[{start:"08:00",end:"17:00"}], breakMins:60, dayType:"work"|"off"|"leave"|"sick", note:"" }
  // rest = 24h - total work minutes + breakMins

  function getDayRecord(crewId, dk) {
    return hoursLog.find(r=>r.crewId===crewId&&r.date===dk) || {crewId, date:dk, workPeriods:[], breakMins:60, dayType:"work", note:""};
  }

  function setDayRecord(crewId, dk, record) {
    setHoursLog(prev=>{
      const idx = prev.findIndex(r=>r.crewId===crewId&&r.date===dk);
      const updated = {...record, crewId, date:dk};
      if(idx>=0){ const n=[...prev]; n[idx]=updated; return n; }
      return [...prev, updated];
    });
  }

  // Convert "HH:MM" to minutes since midnight
  function toMins(t) {
    if(!t) return 0;
    const [h,m] = t.split(":").map(Number);
    return h*60+(m||0);
  }

  // Work minutes for a day (accounting for break)
  // If start === end, treat as a full 24h shift (overnight wrap)
  function calcWorkMins(rec) {
    if(!rec||["off","leave","sick","holiday"].includes(rec.dayType)) return 0;
    const totalWork = (rec.workPeriods||[]).reduce((sum,p)=>{
      if(!p.start||!p.end) return sum;
      const s = toMins(p.start);
      const e = toMins(p.end);
      // Same time = 24h shift; end < start = overnight shift
      const dur = e===s ? 1440 : e>s ? e-s : (1440-s)+e;
      return sum + dur;
    },0);
    return Math.max(0, totalWork - (rec.breakMins||0));
  }

  function calcRestHours(rec) {
    if(!rec) return 24;
    if(["off","leave","sick","holiday"].includes(rec.dayType)) return 24;
    // No work periods entered = treat as unlogged, not as a rest day
    if(!rec.workPeriods||rec.workPeriods.length===0) return 24;
    const workH = calcWorkMins(rec)/60;
    return Math.max(0, Math.round((24 - workH)*10)/10);
  }

  // Convert work periods to rest blocks (array of [startH, endH]) for PDF grid
  function workToRestBlocks(rec) {
    if(!rec||["off","leave","sick","holiday"].includes(rec.dayType)) return [[0,24]];
    if(!rec.workPeriods||rec.workPeriods.length===0) return [[0,24]];
    // Build 24-slot boolean array: true = work
    const isWork = Array(24).fill(false);
    rec.workPeriods.forEach(p=>{
      if(!p.start||!p.end) return;
      const s = Math.floor(toMins(p.start)/60);
      const e = Math.ceil(toMins(p.end)/60);
      if(e===s) { // 24h shift — mark everything
        for(let h=0;h<24;h++) isWork[h]=true;
      } else if(e>s) {
        for(let h=s;h<e&&h<24;h++) isWork[h]=true;
      } else { // overnight: e < s
        for(let h=s;h<24;h++) isWork[h]=true;
        for(let h=0;h<e;h++) isWork[h]=true;
      }
    });
    // Convert to rest blocks (inverse of work)
    const restBlocks = [];
    let start = null;
    for(let h=0;h<=24;h++){
      if(h<24&&!isWork[h]){ if(start===null) start=h; }
      else { if(start!==null){ restBlocks.push([start,h]); start=null; } }
    }
    return restBlocks;
  }

  function calcWeeklyRest(crewId, dayNum) {
    let total = 0;
    for(let i=Math.max(1,dayNum-6);i<=dayNum;i++){
      const dk = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
      const rec = getDayRecord(crewId,dk);
      const isLogged = (rec.workPeriods&&rec.workPeriods.length>0) || ["off","leave","sick","holiday"].includes(rec.dayType);
      if(isLogged) total += calcRestHours(rec);
    }
    return Math.round(total*10)/10;
  }

  function mlcViolations(crewId) {
    const v=[];
    for(let d=1;d<=daysInMonth;d++){
      const dk=`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rec=getDayRecord(crewId,dk);
      // Only check days that have been explicitly logged (have work periods or are a non-work day type)
      const isLogged = (rec.workPeriods&&rec.workPeriods.length>0) || ["off","leave","sick","holiday"].includes(rec.dayType);
      if(!isLogged) continue;
      const rest24=calcRestHours(rec);
      if(rest24<10) v.push({day:d,type:"24h",rest:rest24});
      if(d>=7){ const r7=calcWeeklyRest(crewId,d); if(r7<77) v.push({day:d,type:"7day",rest:r7}); }
    }
    return v;
  }

  // ── QUICK FILL ─────────────────────────────────────────────────
  const PRESETS = [
    {label:"08:00 – 17:00",  tip:"1h break", periods:[{start:"08:00",end:"17:00"}], breakMins:60},
    {label:"07:00 – 19:00",  tip:"1h break", periods:[{start:"07:00",end:"19:00"}], breakMins:60},
    {label:"Watchkeeper",    tip:"4 on/8 off", periods:[{start:"00:00",end:"04:00"},{start:"12:00",end:"16:00"}], breakMins:0},
    {label:"Day off",        tip:"24h rest",   periods:[], breakMins:0, dayType:"off"},
  ];

  function applyPreset(crewId, preset) {
    for(let day=1;day<=daysInMonth;day++){
      const dk=`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const rec=getDayRecord(crewId,dk);
      setDayRecord(crewId,dk,{...rec,
        workPeriods:preset.periods.map(p=>({...p})),
        breakMins:preset.breakMins,
        dayType:preset.dayType||"work",
        note:preset.dayType==="off"?"Day off":rec.note
      });
    }
  }

  function clearMonth(crewId){
    for(let day=1;day<=daysInMonth;day++){
      const dk=`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      setDayRecord(crewId,dk,{crewId,date:dk,workPeriods:[],breakMins:60,dayType:"work",note:""});
    }
  }

  // ── EXPORT HELPERS ─────────────────────────────────────────────
  const CSS = `
    @page{size:A4 landscape;margin:10mm 8mm;}
    body{font-family:Arial,sans-serif;font-size:9px;color:#000;margin:0;padding:8px;}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:0;}
      .page-break{page-break-after:always;}
      td.hour{cursor:default;}
    }
    h2{font-size:11px;text-align:center;margin:0 0 4px;font-weight:bold;}
    .hg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px 12px;margin-bottom:6px;font-size:8.5px;}
    .field{border-bottom:1px solid #000;padding-bottom:1px;margin-bottom:3px;}
    .lbl{font-size:7.5px;color:#444;}
    table{border-collapse:collapse;width:100%;table-layout:fixed;}
    th{background:#e8e8e8;font-size:7px;font-weight:bold;border:1px solid #999;padding:2px 1px;text-align:center;}
    td{border:1px solid #ccc;padding:0;font-size:7.5px;vertical-align:middle;text-align:center;}
    td.hour{width:10px;height:16px;cursor:pointer;transition:background 0.08s;}
    td.hour:hover{opacity:0.75;}
    td.work{background:#1e3a6e;}
    td.rest{background:#fff;}
    td.date-cell{font-weight:bold;font-size:7.5px;padding:1px 3px;}
    td.rest-cell{font-size:8px;font-weight:bold;padding:1px 2px;}
    td.comment-cell{text-align:left;padding:1px 3px;}
    .comment-input{width:100%;border:none;outline:none;font-size:7px;font-family:Arial,sans-serif;background:transparent;padding:0;margin:0;color:#000;}
    .ok{color:#15803d;} .bad{color:#dc2626;}
    .sig{border-bottom:1px solid #000;display:inline-block;width:140px;margin-top:8px;}
    .page-break{page-break-after:always;margin-bottom:16px;}
  `;

  function buildMonthPage(crewMember, year, month, isLastPage) {
    const v = vessel?.profile||{};
    const wk = watchkeeper[crewMember.id]||false;
    const dim = new Date(year, month+1, 0).getDate();
    const mn  = MONTH_NAMES[month];
    const cellW=10, dateColW=34, restColW=36, commentColW=78;
    const pageId = `page_${crewMember.id}_${year}_${month}`;

    function getDk(d){ return `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
    function getRec(d){ return hoursLog.find(r=>r.crewId===crewMember.id&&r.date===getDk(d))||{crewId:crewMember.id,date:getDk(d),workPeriods:[],breakMins:60,dayType:"work",note:""}; }
    function getRest(d){
      const rec=getRec(d);
      if(["off","leave","sick","holiday"].includes(rec.dayType)) return 24;
      if(!rec.workPeriods||!rec.workPeriods.length) return 24;
      const wm=(rec.workPeriods||[]).reduce((s,p)=>{
        if(!p.start||!p.end) return s;
        const sm=toMins(p.start),em=toMins(p.end);
        const dur=em===sm?1440:em>sm?em-sm:(1440-sm)+em;
        return s+dur;
      },0)-(rec.breakMins||0);
      return Math.max(0,Math.round((24-Math.max(0,wm)/60)*10)/10);
    }
    function getWeekRest(d){
      let t=0;
      for(let i=Math.max(1,d-6);i<=d;i++){
        const r=getRec(i);
        const logged=(r.workPeriods&&r.workPeriods.length>0)||["off","leave","sick","holiday"].includes(r.dayType);
        if(logged) t+=getRest(i);
      }
      return Math.round(t*10)/10;
    }

    function buildHourCells(rec, day){
      const isOff = ["off","leave","sick","holiday"].includes(rec.dayType);
      // 48 half-hour slots: slot i = minutes [i*30, i*30+30)
      const isWork = Array(48).fill(false);
      if(!isOff){
        (rec.workPeriods||[]).forEach(p=>{
          if(!p.start||!p.end) return;
          const s = toMins(p.start); // start in mins
          const e = toMins(p.end);   // end in mins
          const sSlot = Math.floor(s/30);
          const eSlot = e===s ? 48 : Math.ceil(e/30);
          if(e===s){ for(let i=0;i<48;i++) isWork[i]=true; } // 24h shift
          else if(eSlot>sSlot){ for(let i=sSlot;i<eSlot&&i<48;i++) isWork[i]=true; }
          else{ for(let i=sSlot;i<48;i++) isWork[i]=true; for(let i=0;i<eSlot;i++) isWork[i]=true; } // overnight
        });
        // Break — mark slots as rest
        const bm = rec.breakMins||0;
        if(bm>0&&(rec.workPeriods||[]).length>0){
          const p0=rec.workPeriods[0];
          if(p0.start&&p0.end){
            const ws=toMins(p0.start), we=toMins(p0.end);
            const mid=Math.floor((ws+we)/2);
            const bStart=Math.floor(mid/30);
            const bSlots=Math.ceil(bm/30);
            for(let i=bStart;i<bStart+bSlots&&i<48;i++) isWork[i]=false;
          }
        }
      }
      return Array.from({length:48},(_,i)=>
        `<td class="hour ${isWork[i]?"work":"rest"}" data-day="${day}" data-slot="${i}" onclick="toggleSlot(this)" title="${String(Math.floor(i/2)).padStart(2,'0')}:${i%2===0?'00':'30'}"></td>`
      ).join("");
    }

    const leaveNote = (d) => {
      const dk=getDk(d);
      const lr=leaveRequests.find(r=>r.crewId===crewMember.id&&r.status==="approved"&&r.start<=dk&&r.end>=dk);
      return lr?"Annual leave":"";
    };

    const rows=Array.from({length:dim},(_,i)=>{
      const d=i+1, rec=getRec(d), rest24=getRest(d), rest7=getWeekRest(d);
      const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(getDk(d)+"T12:00:00").getDay()];
      const isLogged=(rec.workPeriods&&rec.workPeriods.length>0)||["off","leave","sick","holiday"].includes(rec.dayType);
      const note=rec.note||leaveNote(d)||(rec.dayType==="off"?"Day off":rec.dayType==="sick"?"Sick leave":"");
      const r24cls=!isLogged?"":rest24>=10?"ok":"bad";
      const r7cls=!isLogged||rest7===0?"":rest7>=77?"ok":"bad";
      return `<tr id="row_${pageId}_${d}">
        <td class="date-cell">${d} ${dn}</td>
        ${buildHourCells(rec, `${pageId}_${d}`)}
        <td class="rest-cell ${r24cls}" id="r24_${pageId}_${d}">${isLogged?rest24:""}</td>
        <td class="rest-cell ${r7cls}" id="r7_${pageId}_${d}">${isLogged&&rest7>0?rest7:""}</td>
        <td class="comment-cell"><input class="comment-input" id="note_${pageId}_${d}" value="${note.replace(/"/g,"&quot;")}" placeholder="Add note…"/></td>
      </tr>`;
    }).join("");

    const viol24=Array.from({length:dim},(_,i)=>{const d=i+1,r=getRec(d),logged=(r.workPeriods&&r.workPeriods.length>0)||["off","leave","sick","holiday"].includes(r.dayType);return logged&&getRest(d)<10?1:0;}).reduce((a,b)=>a+b,0);

    // Header: hour label spans 2 half-hour columns
    const hourHeaders = Array.from({length:24},(_,h)=>
      `<th colspan="2" style="width:${cellW*2}px;font-size:6px;">${String(h).padStart(2,"0")}</th>`
    ).join("");

    return `<div class="${isLastPage?"":"page-break"}" id="${pageId}">
<h2>ANNEX B — MODEL FORMAT FOR RECORD OF HOURS OF REST OF SEAFARERS</h2>
<div class="hg">
  <div><div class="lbl">Name of Ship</div><div class="field">${v.yachtName||"M/Y Tiberius"}</div>
       <div class="lbl">Seafarer (full name)</div><div class="field" style="font-weight:bold;font-size:9px;">${crewMember.name}</div>
       <div style="font-size:8px;color:#444;margin-top:1px;">${crewMember.position}</div></div>
  <div><div class="lbl">IMO Number</div><div class="field">${v.imoNumber||"—"}</div>
       <div class="lbl">Position / Rank</div><div class="field" style="font-weight:bold;">${crewMember.position}</div></div>
  <div><div class="lbl">Flag State</div><div class="field">${v.flagState||"—"}</div>
       <div class="lbl">Month / Year &nbsp; Watchkeeper: ${wk?"Yes":"No"}</div>
       <div class="field">${mn} ${year}</div></div>
</div>
<div style="font-size:7px;margin-bottom:3px;color:#555;">Blue = work / on duty. White = rest. Each column = 30 minutes. Tap a cell to toggle. Tap comments to type.</div>
<table><thead>
<tr>
  <th rowspan="2" style="width:${dateColW}px;">Date</th>
  ${hourHeaders}
  <th rowspan="2" style="width:${restColW}px;">Rest<br/>hrs<br/>24h</th>
  <th rowspan="2" style="width:${restColW}px;">Rest<br/>hrs<br/>7d</th>
  <th rowspan="2" style="width:${commentColW}px;">Comments</th>
</tr>
<tr>
  ${Array.from({length:48},(_,i)=>`<td style="font-size:5px;text-align:center;padding:0;border:1px solid #ccc;color:#999;">${i%2===0?"":":30"}</td>`).join("")}
</tr>
</thead><tbody>
${rows}
</tbody></table>
<div style="margin-top:6px;font-size:7.5px;">
  <div style="margin-bottom:3px;">Applicable regulations: <b>MLC 2006 / STCW 1978 as amended (Manila 2010)</b></div>
  ${viol24>0?`<div style="color:#dc2626;font-weight:bold;margin-bottom:3px;">⚠ ${viol24} daily rest violation(s) this month</div>`:""}
  <div>I agree that this record accurately reflects the hours of rest of the seafarer concerned.</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-top:6px;">
    <div><div class="lbl">Master / authorised person</div><div class="field">${captain?.name||"Captain"}</div>
         <div style="margin-top:6px;"><span class="lbl">Signature: </span><span class="sig"></span></div></div>
    <div><div class="lbl">Signature of seafarer</div><span class="sig"></span>
         <div style="margin-top:3px;font-size:7px;">A copy to be given to the seafarer.</div></div>
  </div>
</div></div>`;
  }

  function openExport(pages, filename) {
    const body = pages.map((p,i)=>buildMonthPage(p.crewMember, p.year, p.month, i===pages.length-1)).join("\n");
    // Embedded JS for interactive editing — recalculates rest totals on cell toggle
    const interactiveJS = `
<script>
function toggleSlot(td) {
  const isWork = td.classList.contains('work');
  td.classList.toggle('work', !isWork);
  td.classList.toggle('rest', isWork);
  recalcRow(td.dataset.day);
}

function recalcRow(dayKey) {
  // Count work slots (each = 0.5h)
  const cells = document.querySelectorAll('[data-day="'+dayKey+'"]');
  let workSlots = 0;
  cells.forEach(c => { if(c.classList.contains('work')) workSlots++; });
  const restHrs = Math.round((24 - workSlots * 0.5) * 10) / 10;
  const parts = dayKey.split('_');
  const day = parseInt(parts[parts.length-1]);
  const pageId = parts.slice(0,-1).join('_');

  const r24 = document.getElementById('r24_'+dayKey);
  if(r24) {
    r24.textContent = restHrs;
    r24.className = 'rest-cell ' + (restHrs >= 10 ? 'ok' : 'bad');
  }
  recalc7day(pageId, day);
}

function recalc7day(pageId, changedDay) {
  const allR24 = document.querySelectorAll('[id^="r24_'+pageId+'_"]');
  const maxDay = allR24.length;
  const start = Math.max(1, changedDay - 6);
  const end   = Math.min(maxDay, changedDay + 6);
  for(let d = start; d <= end; d++) {
    let total7 = 0;
    for(let i = Math.max(1, d-6); i <= d; i++) {
      const r24el = document.getElementById('r24_'+pageId+'_'+i);
      if(r24el && r24el.textContent.trim()) total7 += parseFloat(r24el.textContent) || 0;
    }
    const r7el = document.getElementById('r7_'+pageId+'_'+d);
    if(r7el) {
      r7el.textContent = total7 > 0 ? Math.round(total7*10)/10 : '';
      r7el.className = 'rest-cell ' + (total7 >= 77 ? 'ok' : (total7 > 0 ? 'bad' : ''));
    }
  }
}
<\/script>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${filename}</title><style>${CSS}</style></head><body>
${body}
${interactiveJS}
</body></html>`;

    window.history.pushState({view:"hours", modal:"export"}, "", "");
    setExportHtml(html);
    setExportFilename(filename);
    logH("Annex B Generated", filename);
  }

  function exportAnnexB() {
    if(!selCrew) return;
    openExport(
      [{crewMember:selCrew, year:viewYear, month:viewMonth}],
      `Crew Hours — ${selCrew.name} — ${selCrew.position} — ${MONTH_NAMES[viewMonth]} ${viewYear}`
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────
  const violations  = selCrew ? mlcViolations(selCrew.id) : [];
  const daily24Viol = new Set(violations.filter(v=>v.type==="24h").map(v=>v.day));
  const daily7Viol  = new Set(violations.filter(v=>v.type==="7day").map(v=>v.day));

  const DAY_TYPES = [
    {id:"work",    label:"Working"},
    {id:"off",     label:"Day Off"},
    {id:"leave",   label:"Annual Leave"},
    {id:"sick",    label:"Sick Leave"},
    {id:"holiday", label:"Public Holiday"},
  ];

  return <div>
    {/* Header */}
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}>
        <Ico i={Clock} s={20} c={C.navy}/>Hours of Rest
      </div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>MLC 2006 / STCW · Annex B export · Enter work hours, rest is calculated automatically</div>
    </div>

    {/* Crew selector */}
    {isAdmin&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {crew.filter(c=>!["owner","management","agent"].includes(c.role)).map(c=>(
        <button key={c.id} onClick={()=>{setSelCrewId(c.id);setExpandDay(null);}}
          style={{...btn,padding:"7px 14px",fontSize:12,fontWeight:selCrewId===c.id?700:400,
            background:selCrewId===c.id?C.navy:C.navyLight,
            color:selCrewId===c.id?C.white:C.text,
            border:`1px solid ${selCrewId===c.id?C.navy:C.border}`,borderRadius:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <RoleIcon role={c.role} size={12} color={selCrewId===c.id?C.brassL:C.muted}/>
            {c.name.split(" ")[0]}
          </div>
        </button>
      ))}
    </div>}

    {selCrew&&<>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <button onClick={prevMonth} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"7px 14px",fontSize:14}}>‹</button>
        <div style={{fontSize:15,fontWeight:800,color:C.navy,flex:1,textAlign:"center"}}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
        <button onClick={nextMonth} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"7px 14px",fontSize:14}}>›</button>
      </div>

      {/* MLC compliance banner */}
      {violations.length===0
        ?<div style={{background:`${C.greenL}12`,border:`1px solid ${C.greenL}44`,borderRadius:8,padding:"9px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
          <Ico i={CheckCircle} s={16} c={C.greenL}/>
          <div style={{fontSize:12,fontWeight:600,color:C.green}}>MLC compliant — no rest violations this month</div>
        </div>
        :<div style={{background:`${C.signal}0d`,border:`1px solid ${C.signal}44`,borderRadius:8,padding:"9px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
          <Ico i={AlertTriangle} s={16} c={C.signal}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.signal}}>{daily24Viol.size} daily · {daily7Viol.size} weekly rest violation{violations.length!==1?"s":""}</div>
            <div style={{fontSize:10,color:C.muted}}>Min 10 hrs rest/day · 77 hrs rest/week</div>
          </div>
        </div>}

      {/* Action bar — quick fill + watchkeeper + export */}
      <div style={{background:C.navyLight,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,flexShrink:0}}>Fill whole month:</span>
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>applyPreset(selCrew.id,p)}
              style={{...btn,background:C.card,color:C.text,border:`1px solid ${C.border}`,padding:"6px 12px",fontSize:12,borderRadius:8}}>
              <div style={{fontWeight:600}}>{p.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{p.tip}</div>
            </button>
          ))}
          <button onClick={()=>clearMonth(selCrew.id)}
            style={{...btn,background:C.signal+"15",color:C.signal,border:`1px solid ${C.signal}33`,padding:"6px 12px",fontSize:12,marginLeft:"auto"}}>
            Clear
          </button>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setWatchkeeper(p=>({...p,[selCrew.id]:!p[selCrew.id]}))}
            style={{...btn,background:watchkeeper[selCrew.id]?C.navy:C.card,color:watchkeeper[selCrew.id]?C.white:C.muted,border:`1px solid ${watchkeeper[selCrew.id]?C.navy:C.border}`,padding:"6px 12px",fontSize:11}}>
            Watchkeeper: {watchkeeper[selCrew.id]?"Yes":"No"}
          </button>
          <button onClick={exportAnnexB} style={{...btn,background:C.navy,color:C.white,padding:"6px 16px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
            <Ico i={FileText} s={13} c={C.brassL}/>Export Annex B PDF
          </button>
        </div>
      </div>

      {/* Day list */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {Array.from({length:daysInMonth},(_,i)=>{
          const day     = i+1;
          const dk      = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const rec     = getDayRecord(selCrew.id, dk);
          const rest24  = calcRestHours(rec);
          const rest7   = calcWeeklyRest(selCrew.id, day);
          const v24     = daily24Viol.has(day);
          const v7      = daily7Viol.has(day);
          const dateObj = new Date(dk+"T12:00:00");
          const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dateObj.getDay()];
          const isWeekend = dateObj.getDay()===0||dateObj.getDay()===6;
          const isExp   = expandDay===dk;
          const isOff   = ["off","leave","sick","holiday"].includes(rec.dayType);
          const onLeave = leaveRequests.find(lr=>lr.crewId===selCrew.id&&lr.status==="approved"&&lr.start<=dk&&lr.end>=dk);
          const dayTypeLabel = DAY_TYPES.find(t=>t.id===rec.dayType)?.label||"Working";
          const workMins = calcWorkMins(rec);
          const workH   = Math.floor(workMins/60);
          const workM   = workMins%60;

          return <div key={dk} style={{borderRadius:10,overflow:"hidden",border:`1.5px solid ${v24?C.signal+"66":isExp?C.blue+"88":C.border}`}}>
            {/* Collapsed row — tap to expand */}
            <div onClick={()=>setExpandDay(isExp?null:dk)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:isWeekend&&!isExp?`${C.navyLight}88`:C.card,userSelect:"none"}}>

              {/* Day label */}
              <div style={{width:44,flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:800,color:v24?C.signal:C.navy,lineHeight:1}}>{day}</div>
                <div style={{fontSize:9,color:C.muted,fontWeight:600}}>{dayName}</div>
              </div>

              {/* Status summary */}
              <div style={{flex:1,minWidth:0}}>
                {isOff
                  ? <div style={{fontSize:13,color:C.muted,fontWeight:500}}>{dayTypeLabel}</div>
                  : rec.workPeriods&&rec.workPeriods.length>0
                    ? <div style={{fontSize:12,color:C.text,fontWeight:600}}>
                        {rec.workPeriods.map((p,pi)=>`${p.start}–${p.end}`).join("  +  ")}
                        {rec.breakMins>0&&<span style={{color:C.muted,fontSize:11,fontWeight:400}}> · {rec.breakMins}min break</span>}
                      </div>
                    : <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Tap to enter hours</div>
                }
                {rec.note&&<div style={{fontSize:10,color:C.brass,marginTop:1}}>{rec.note}</div>}
              </div>

              {/* Rest hours pill */}
              <div style={{flexShrink:0,textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:800,color:v24?C.signal:rest24>=10?C.greenL:C.amber}}>
                  {isOff?"24h rest":(rec.workPeriods&&rec.workPeriods.length>0)?`${rest24}h rest`:"—"}
                </div>
                <div style={{fontSize:9,color:v7?C.signal:C.muted}}>{rest7>0?`7d: ${rest7}h`:""}</div>
              </div>

              <Ico i={isExp?ChevronDown:ChevronRight} s={16} c={C.muted}/>
            </div>

            {/* Expanded entry panel */}
            {isExp&&<div style={{background:C.navyLight,padding:"12px 14px",borderTop:`1px solid ${C.border}`}}>

              {/* Day type selector */}
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:6}}>Day type</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {DAY_TYPES.map(t=>(
                  <button key={t.id} onClick={()=>{
                    const note = t.id==="leave"?"Annual leave":t.id==="sick"?"Sick leave":t.id==="holiday"?"Public holiday":t.id==="off"?"Day off":rec.note;
                    setDayRecord(selCrew.id,dk,{...rec,dayType:t.id,note,workPeriods:t.id==="work"?rec.workPeriods:[]});
                  }}
                    style={{...btn,padding:"7px 14px",fontSize:12,fontWeight:rec.dayType===t.id?700:400,
                      background:rec.dayType===t.id?C.navy:C.card,
                      color:rec.dayType===t.id?C.white:C.text,
                      border:`1px solid ${rec.dayType===t.id?C.navy:C.border}`,borderRadius:8}}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Work periods — only shown when dayType=work */}
              {rec.dayType==="work"&&<>
                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:6}}>Work periods</div>

                {(rec.workPeriods||[]).map((period,pi)=>(
                  <div key={pi} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,background:C.card,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flex:1,flexWrap:"wrap"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                        <span style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.6}}>Start</span>
                        <input type="time" value={period.start}
                          onChange={e=>{const ps=[...rec.workPeriods];ps[pi]={...ps[pi],start:e.target.value};setDayRecord(selCrew.id,dk,{...rec,workPeriods:ps});}}
                          style={{...inp,fontSize:16,padding:"4px 6px",width:100,fontWeight:700,color:C.navy}}/>
                      </div>
                      <div style={{fontSize:18,color:C.muted,paddingTop:14}}>→</div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                        <span style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.6}}>End</span>
                        <input type="time" value={period.end}
                          onChange={e=>{const ps=[...rec.workPeriods];ps[pi]={...ps[pi],end:e.target.value};setDayRecord(selCrew.id,dk,{...rec,workPeriods:ps});}}
                          style={{...inp,fontSize:16,padding:"4px 6px",width:100,fontWeight:700,color:C.navy}}/>
                      </div>
                    </div>
                    <button onClick={()=>{const ps=rec.workPeriods.filter((_,j)=>j!==pi);setDayRecord(selCrew.id,dk,{...rec,workPeriods:ps});}}
                      style={{...btn,background:"transparent",border:"none",padding:4,color:C.signal,flexShrink:0}}>
                      <Ico i={X} s={16} c={C.signal}/>
                    </button>
                  </div>
                ))}

                {/* Add period button */}
                <button onClick={()=>{
                  const last = rec.workPeriods?.slice(-1)[0];
                  const newP = last?{start:last.end,end:"17:00"}:{start:"08:00",end:"17:00"};
                  setDayRecord(selCrew.id,dk,{...rec,workPeriods:[...(rec.workPeriods||[]),newP]});
                }} style={{...btn,background:C.card,color:C.blue,border:`1px dashed ${C.blue}66`,padding:"8px 14px",fontSize:12,width:"100%",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <Ico i={Plus} s={14} c={C.blue}/>Add work period
                </button>

                {/* Break */}
                {(rec.workPeriods||[]).length>0&&<>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:6}}>Break / rest during work</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    {[0,30,45,60,90].map(mins=>(
                      <button key={mins} onClick={()=>setDayRecord(selCrew.id,dk,{...rec,breakMins:mins})}
                        style={{...btn,padding:"7px 14px",fontSize:13,fontWeight:rec.breakMins===mins?700:400,
                          background:rec.breakMins===mins?C.navy:C.card,
                          color:rec.breakMins===mins?C.white:C.text,
                          border:`1px solid ${rec.breakMins===mins?C.navy:C.border}`,borderRadius:8}}>
                        {mins===0?"No break":`${mins} min`}
                      </button>
                    ))}
                  </div>
                </>}

                {/* Rest result */}
                {(rec.workPeriods||[]).length>0&&<div style={{background:v24?`${C.signal}12`:`${C.greenL}12`,border:`1px solid ${v24?C.signal:C.greenL}44`,borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                  <Ico i={v24?AlertTriangle:CheckCircle} s={16} c={v24?C.signal:C.greenL}/>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:v24?C.signal:C.green}}>
                      {rest24}h rest today
                      {!v24&&<span style={{fontSize:11,fontWeight:400,color:C.muted}}> — MLC compliant ✓</span>}
                      {v24&&<span style={{fontSize:11,fontWeight:400,color:C.signal}}> — needs {10-rest24}h more</span>}
                    </div>
                    <div style={{fontSize:10,color:C.muted}}>
                      Work: {workH}h{workM?` ${workM}m`:""} · Break: {rec.breakMins||0}min
                    </div>
                  </div>
                </div>}
              </>}

              {/* Note field */}
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:5}}>Note for Annex B (optional)</div>
              <input value={rec.note||""} onChange={e=>setDayRecord(selCrew.id,dk,{...rec,note:e.target.value})}
                placeholder="e.g. Annual leave, Port leave, Special duties…"
                style={{...inp,width:"100%",padding:"9px 12px",fontSize:13}}/>
            </div>}
          </div>;
        })}
      </div>

      {/* Bottom info */}
      <div style={{marginTop:14,padding:"10px 14px",background:C.navyLight,borderRadius:8,fontSize:11,color:C.muted,lineHeight:1.6}}>
        <b style={{color:C.text}}>MLC 2006 minimum rest:</b> 10 hours in any 24-hour period · 77 hours in any 7-day period.
        Rest may be split into no more than two periods, one of which must be at least 6 hours.
      </div>
    </>}

    {/* ── CAPTAIN BULK EXPORT ──────────────────────────────────── */}
    {isAdmin&&<CaptainExportPanel
      crew={crew} hoursLog={hoursLog} leaveRequests={leaveRequests}
      vessel={vessel} captain={captain} watchkeeper={watchkeeper}
      MONTH_NAMES={MONTH_NAMES} toMins={toMins} buildMonthPage={buildMonthPage} openExport={openExport}
    />}

    {/* ── EXPORT PREVIEW MODAL ─────────────────────────────────── */}
    {exportHtml&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:2000,display:"flex",flexDirection:"column"}}>
      {/* Toolbar */}
      <div style={{background:C.navy,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
          <Ico i={FileText} s={16} c={C.brassL}/>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:C.white,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{exportFilename}</div>
            <div style={{fontSize:10,color:C.brassL+"99"}}>Tap cells to toggle work/rest · Tap Comments column to type</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button onClick={()=>{
            try{ iframeRef.current?.contentWindow?.print(); }
            catch(e){ alert("Printing requires the app to be live (Netlify). Print is not available inside Claude."); }
          }} style={{background:C.brass,color:C.navy,border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}>
            <Ico i={Printer} s={15} c={C.navy}/>Print / Save as PDF
          </button>
          <button onClick={()=>setExportHtml(null)}
            style={{background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,color:C.white,borderRadius:8,padding:"9px 16px",fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
            Close
          </button>
        </div>
      </div>
      {/* iframe preview */}
      <iframe
        ref={iframeRef}
        srcDoc={exportHtml}
        style={{flex:1,border:"none",background:"#fff"}}
        title="Annex B Preview"
      />
    </div>}
  </div>;
}

function MaintenanceModule({assets,setAssets,jobs,setJobs,role,logAudit}) {
  const logM = (action,detail) => logAudit&&logAudit(action,detail,"Maintenance");
  const [subView,setSubView] = useState("assets"); // assets | jobs
  const [selectedAsset,setSelectedAsset] = useState(null);
  const [selectedJob,setSelectedJob]     = useState(null);
  const [showAssetForm,setShowAssetForm] = useState(false);
  const [showJobForm,setShowJobForm]     = useState(false);
  const [editAsset,setEditAsset]         = useState(null);
  const [editJob,setEditJob]             = useState(null);
  const [catFilter,setCatFilter]         = useState("All");
  const [statusFilter,setStatusFilter]   = useState("All");
  const [search,setSearch]               = useState("");
  const fileRef = useRef(null);

  const canEdit = ["captain","management","engineer"].includes(role);

  const EMPTY_ASSET = {name:"",category:"Propulsion",manufacturer:"",model:"",serial:"",installedDate:"",currentHours:0,serviceIntervalHours:250,lastServiceHours:0,lastServiceDate:"",notes:"",photos:[],history:[]};
  const EMPTY_JOB   = {assetId:"",title:"",desc:"",priority:"High",assignedTo:"engineer",scheduledDate:TODAY,checklist:[{id:`c${Date.now()}`,text:"",done:false}],partsUsed:[],hoursWorked:0,notes:"",photos:{before:[],after:[]},signedOffBy:null};

  const [aForm,setAForm] = useState(EMPTY_ASSET);
  const [jForm,setJForm] = useState({...EMPTY_JOB});

  // Filtered assets
  const visibleAssets = assets.filter(a=>{
    const st = assetServiceStatus(a);
    if(catFilter!=="All" && a.category!==catFilter) return false;
    if(statusFilter!=="All" && st!==statusFilter) return false;
    if(search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.manufacturer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Filtered jobs
  const visibleJobs = jobs.filter(j=>{
    if(search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const overdueAssets = assets.filter(a=>assetServiceStatus(a)==="Overdue");
  const dueSoonAssets = assets.filter(a=>assetServiceStatus(a)==="Due Soon");
  const openJobs      = jobs.filter(j=>j.status!=="Done"&&j.status!=="Cancelled");

  function openAssetForm(asset) {
    setEditAsset(asset||null);
    setAForm(asset?{...asset}:{...EMPTY_ASSET});
    setShowAssetForm(true);
  }

  function saveAsset() {
    if(!aForm.name) return;
    if(editAsset) {
      setAssets(p=>p.map(a=>a.id===editAsset.id?{...a,...aForm}:a));
      logM("Asset Updated",`${aForm.name} — updated`);
    } else {
      const newAsset={...aForm,id:`a${Date.now()}`,history:[]};
      setAssets(p=>[...p,newAsset]);
      logM("Asset Added",`${aForm.name} added (${aForm.category})`);
    }
    setShowAssetForm(false);
  }

  function deleteAsset(id,name) {
    setAssets(p=>p.filter(a=>a.id!==id));
    setSelectedAsset(null);
    logM("Asset Deleted",`${name} removed from system`);
  }

  function updateHours(id,hours) {
    setAssets(p=>p.map(a=>a.id===id?{...a,currentHours:Number(hours)}:a));
  }

  function addServiceRecord(assetId,record) {
    setAssets(p=>p.map(a=>{
      if(a.id!==assetId) return a;
      const newRecord={...record,id:`h${Date.now()}`};
      return {...a,
        lastServiceHours:record.resetHours?a.currentHours:a.lastServiceHours,
        lastServiceDate:record.date,
        history:[newRecord,...a.history],
      };
    }));
    logM("Service Recorded",`${assets.find(a=>a.id===assetId)?.name} — ${record.type} logged`);
  }

  function openJobForm(job,assetId) {
    setEditJob(job||null);
    setJForm(job?{...job,checklist:job.checklist.map(c=>({...c}))}:{...EMPTY_JOB,assetId:assetId||"",id:`JC-${String(Date.now()).slice(-3)}`});
    setShowJobForm(true);
  }

  function saveJob() {
    if(!jForm.title) return;
    if(editJob) {
      setJobs(p=>p.map(j=>j.id===editJob.id?{...j,...jForm}:j));
      logM("Job Updated",`${jForm.title} — updated`);
    } else {
      const newJob={...jForm,id:`JC-${String(Date.now()).slice(-3)}`,status:"Pending",createdDate:TODAY,completedDate:null};
      setJobs(p=>[...p,newJob]);
      logM("Job Created",`Job card ${newJob.id}: ${jForm.title}`);
    }
    setShowJobForm(false);
  }

  function toggleCheckItem(jobId,itemId) {
    setJobs(p=>p.map(j=>j.id===jobId?{...j,checklist:j.checklist.map(c=>c.id===itemId?{...c,done:!c.done}:c)}:j));
    if(selectedJob?.id===jobId) setSelectedJob(p=>({...p,checklist:p.checklist.map(c=>c.id===itemId?{...c,done:!c.done}:c)}));
  }

  function setJobStatus(jobId,status) {
    setJobs(p=>p.map(j=>j.id===jobId?{...j,status,completedDate:status==="Done"?TODAY:null}:j));
    if(selectedJob?.id===jobId) setSelectedJob(p=>({...p,status}));
    logM("Job Updated",`Job ${jobId} marked ${status}`);
  }

  function signOffJob(jobId) {
    setJobs(p=>p.map(j=>j.id===jobId?{...j,status:"Done",signedOffBy:role,completedDate:TODAY}:j));
    setSelectedJob(null);
    logM("Job Signed Off",`Job ${jobId} signed off by ${ROLES[role]?.label}`);
    // Auto-update asset service record
    const job=jobs.find(j=>j.id===jobId);
    if(job?.assetId) addServiceRecord(job.assetId,{date:TODAY,type:"Service",desc:job.title,technician:ROLES[job.assignedTo]?.label,hours:job.hoursWorked,parts:job.partsUsed.join(", "),resetHours:true});
  }

  function deleteJob(id) {
    setJobs(p=>p.filter(j=>j.id!==id));
    setSelectedJob(null);
  }

  // ── ASSET CARD ──────────────────────────────────────────────
  function AssetCard({asset}) {
    const st  = assetServiceStatus(asset);
    const rem = hoursUntilService(asset);
    const sc  = assetStatusColor(st);
    const pct = asset.serviceIntervalHours
      ? Math.max(0,Math.min(100,Math.round(((asset.currentHours-asset.lastServiceHours)/asset.serviceIntervalHours)*100)))
      : 0;
    const catColors={Propulsion:C.brassL,Electrical:C.blue,Systems:C.purple,HVAC:C.greenL,Tender:C.orange,"Water Toys":C.greenL,Navigation:C.blue,Safety:C.signal,Hydraulics:C.amber};

    return <div onClick={()=>setSelectedAsset(asset)} style={{background:C.card,border:`1px solid ${st==="Overdue"?C.signal+"55":st==="Due Soon"?C.amber+"44":C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:10,padding:16,cursor:"pointer",transition:"border-color .15s"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=C.brass+"88"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=st==="Overdue"?C.signal+"55":st==="Due Soon"?C.amber+"44":C.border}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:catColors[asset.category]||C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{asset.category}</div>
          <div style={{fontWeight:700,color:C.text,fontSize:14,lineHeight:1.2}}>{asset.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{asset.manufacturer} {asset.model}</div>
        </div>
        <Pill label={st} bg={sc+"22"} color={sc} small dot/>
      </div>
      {asset.serviceIntervalHours>0&&<>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:11,color:C.muted}}>Service {rem<=0?"overdue":"in"}</span>
          <span style={{fontSize:11,fontWeight:700,color:sc}}>{rem===null?"—":rem<=0?`${Math.abs(rem)}hrs overdue`:`${rem}hrs`}</span>
        </div>
        <div style={{background:C.navyLight,borderRadius:4,overflow:"hidden",height:5,marginBottom:4}}>
          <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:pct>=100?C.signal:pct>=80?C.amber:C.green,transition:"width .3s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:10,color:C.muted}}>Current: {asset.currentHours.toLocaleString()}hrs</span>
          <span style={{fontSize:10,color:C.muted}}>Last svc: {asset.lastServiceDate||"—"}</span>
        </div>
      </>}
      {!asset.serviceIntervalHours&&<div style={{fontSize:11,color:C.muted}}>Last service: {asset.lastServiceDate||"—"}</div>}
    </div>;
  }

  // ── JOB CARD ROW ────────────────────────────────────────────
  function JobRow({job}) {
    const asset = assets.find(a=>a.id===job.assetId);
    const done  = job.checklist.filter(c=>c.done).length;
    const total = job.checklist.length;
    const sc    = job.status==="Done"?C.greenL:job.status==="In Progress"?C.amber:job.status==="Overdue"?C.signal:C.muted;
    return <div onClick={()=>setSelectedJob(job)} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:8,padding:"12px 14px",marginBottom:8,cursor:"pointer",transition:"background .12s"}}
      onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
      onMouseLeave={e=>e.currentTarget.style.background=C.card}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:5,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
            <Pill label={job.priority} bg={job.priority==="Critical"?"#4a101022":job.priority==="High"?"#3d1a1a":C.navyLight} color={job.priority==="Critical"?C.signal:job.priority==="High"?"#f87171":C.muted} small/>
            <Pill label={job.status} bg={sc+"22"} color={sc} small dot/>
            {asset&&<Pill label={asset.name} bg={C.navyLight} color={C.muted} small/>}
          </div>
          <div style={{fontWeight:600,color:C.text,fontSize:13}}><span style={{color:C.muted,fontSize:11}}>{job.id} · </span>{job.title}</div>
          {job.notes&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{job.notes}</div>}
        </div>
        <div style={{flexShrink:0,textAlign:"right"}}>
          <div style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:5}}><RoleIcon role={job.assignedTo} size={11}/>{ROLES[job.assignedTo]?.label}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:3}}>{done}/{total} checks</div>
          {total>0&&<div style={{width:60,height:4,background:C.navyLight,borderRadius:2,overflow:"hidden",marginTop:4}}>
            <div style={{width:`${(done/total)*100}%`,height:"100%",background:done===total?C.greenL:C.amber}}/>
          </div>}
        </div>
      </div>
    </div>;
  }

  // ── SERVICE RECORD FORM ──────────────────────────────────────
  const [showSvcForm,setShowSvcForm] = useState(false);
  const [svcForm,setSvcForm] = useState({date:TODAY,type:"Service",desc:"",technician:"",hours:0,parts:"",resetHours:true});

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div>


      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Maintenance</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{overdueAssets.length} overdue · {dueSoonAssets.length} due soon · {openJobs.length} open jobs</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {canEdit&&<button onClick={()=>openJobForm(null,null)} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>+ Job Card</button>}
        {canEdit&&<button onClick={()=>openAssetForm(null)} style={{...btn,background:C.brass,color:C.bg}}>+ Add Asset</button>}
      </div>
    </div>

    {/* Alert row */}
    {(overdueAssets.length>0||dueSoonAssets.length>0)&&<div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
      {overdueAssets.length>0&&<div style={{background:C.signal+"12",border:`1px solid ${C.signal}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:180}}>
        <div style={{fontWeight:700,color:C.signal,fontSize:12,marginBottom:5}}>Service Overdue ({overdueAssets.length})</div>
        {overdueAssets.map(a=>{
          const rem=hoursUntilService(a);
          return <div key={a.id} onClick={()=>setSelectedAsset(a)} style={{fontSize:11,color:C.muted,marginBottom:2,cursor:"pointer"}}>{a.name} — {Math.abs(rem)}hrs overdue</div>;
        })}
      </div>}
      {dueSoonAssets.length>0&&<div style={{background:C.amber+"12",border:`1px solid ${C.amber}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:180}}>
        <div style={{fontWeight:700,color:C.amber,fontSize:12,marginBottom:5}}>Due Soon ({dueSoonAssets.length})</div>
        {dueSoonAssets.map(a=>{
          const rem=hoursUntilService(a);
          return <div key={a.id} onClick={()=>setSelectedAsset(a)} style={{fontSize:11,color:C.muted,marginBottom:2,cursor:"pointer"}}>{a.name} — {rem}hrs remaining</div>;
        })}
      </div>}
    </div>}

    {/* Sub-nav */}
    <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:14,width:"fit-content"}}>
      {[["assets","Assets",""],["jobs","Job Cards",""]].map(([id,label,icon])=>(
        <button key={id} onClick={()=>setSubView(id)} style={{...btn,background:subView===id?C.card:"transparent",color:subView===id?C.navy:C.muted,padding:"6px 16px",fontSize:12,border:"none",display:"flex",alignItems:"center",gap:5}}>
          <span>{icon}</span>{label}
          {id==="jobs"&&openJobs.length>0&&<span style={{background:C.amber,color:C.bg,borderRadius:10,fontSize:9,padding:"1px 5px",fontWeight:700}}>{openJobs.length}</span>}
          {id==="scheduler"&&<span style={{background:C.brass,color:C.bg,borderRadius:8,fontSize:8,padding:"1px 5px",fontWeight:700}}>AI</span>}
        </button>
      ))}
    </div>

    {/* ASSETS VIEW */}
    {subView==="assets"&&<>
      {/* Filters */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets…"
          style={{...inp,width:180,padding:"6px 10px",fontSize:12}}/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
          <option value="All">All Categories</option>
          {ASSET_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        {["All","Good","Due Soon","Overdue","Calendar"].map(f=>(
          <button key={f} onClick={()=>setStatusFilter(f)} style={{...btn,background:statusFilter===f?C.brass:C.navyLight,color:statusFilter===f?C.bg:C.muted,border:`1px solid ${statusFilter===f?C.brass:C.border}`,padding:"5px 11px",fontSize:11}}>{f}</button>
        ))}
        {(search||catFilter!=="All"||statusFilter!=="All")&&<button onClick={()=>{setSearch("");setCatFilter("All");setStatusFilter("All");}} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear</button>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {visibleAssets.map(a=><AssetCard key={a.id} asset={a}/>)}
        {visibleAssets.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 0",color:C.muted}}>No assets match this filter.</div>}
      </div>
    </>}

    {/* JOBS VIEW */}
    {subView==="jobs"&&<>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs…"
          style={{...inp,width:180,padding:"6px 10px",fontSize:12}}/>
        {["All","Pending","In Progress","Done"].map(f=>(
          <button key={f} onClick={()=>setStatusFilter(f==="All"?"All":f)} style={{...btn,background:statusFilter===f?C.brass:C.navyLight,color:statusFilter===f?C.bg:C.muted,border:`1px solid ${statusFilter===f?C.brass:C.border}`,padding:"5px 11px",fontSize:11}}>{f}</button>
        ))}
      </div>
      {visibleJobs.filter(j=>statusFilter==="All"||j.status===statusFilter).map(j=><JobRow key={j.id} job={j}/>)}
      {visibleJobs.filter(j=>statusFilter==="All"||j.status===statusFilter).length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>No job cards yet.</div>}
    </>}

    {/* ── ASSET DETAIL MODAL ─────────────────────────────────── */}
    {selectedAsset&&(()=>{
      const asset=assets.find(a=>a.id===selectedAsset.id)||selectedAsset;
      const st=assetServiceStatus(asset);
      const rem=hoursUntilService(asset);
      const sc=assetStatusColor(st);
      return <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:1000,padding:16,overflowY:"auto"}} onClick={()=>setSelectedAsset(null)}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:580,maxWidth:"95vw",padding:24,marginTop:24}} onClick={e=>e.stopPropagation()}>
          <BackBtn onBack={()=>setSelectedAsset(null)} label="Back to Assets"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{asset.category}</div>
              <div style={{fontSize:18,fontWeight:800,color:C.navy}}>{asset.name}</div>
              <div style={{fontSize:12,color:C.muted}}>{asset.manufacturer} {asset.model} · S/N: {asset.serial||"—"}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Pill label={st} bg={sc+"22"} color={sc} dot/>
              <button onClick={()=>setSelectedAsset(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>×</button>
            </div>
          </div>

          {/* Hours + progress */}
          {asset.serviceIntervalHours>0&&<div style={{background:C.navyLight,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.text}}>Service interval: every {asset.serviceIntervalHours}hrs</span>
              <span style={{fontSize:12,fontWeight:700,color:sc}}>{rem<=0?`${Math.abs(rem)}hrs overdue`:`${rem}hrs until next`}</span>
            </div>
            <div style={{background:C.border,borderRadius:4,overflow:"hidden",height:7}}>
              <div style={{width:`${Math.min(((asset.currentHours-asset.lastServiceHours)/asset.serviceIntervalHours)*100,100)}%`,height:"100%",background:rem<=0?C.signal:rem<=50?C.amber:C.greenL,transition:"width .3s"}}/>
            </div>
          </div>}

          {/* Info grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {[
              ["Current Hours",asset.currentHours?`${asset.currentHours.toLocaleString()} hrs`:"—"],
              ["Last Service",asset.lastServiceDate||"—"],
              ["Last Svc Hours",asset.lastServiceHours?`${asset.lastServiceHours.toLocaleString()} hrs`:"—"],
              ["Installed",asset.installedDate||"—"],
            ].map(([k,v])=><div key={k} style={{background:C.navyLight,borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2}}>{k}</div>
              <div style={{fontSize:12,color:C.text,fontWeight:600}}>{v}</div>
            </div>)}
          </div>

          {/* Update hours inline */}
          {canEdit&&<div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
            <span style={{fontSize:12,color:C.muted,flexShrink:0}}>Update hours:</span>
            <input type="number" defaultValue={asset.currentHours} onBlur={e=>updateHours(asset.id,e.target.value)}
              style={{...inp,width:120,padding:"5px 8px",fontSize:12}} min={0}/>
            <span style={{fontSize:11,color:C.muted}}>hrs</span>
          </div>}

          {asset.notes&&<div style={{background:C.navyLight,borderRadius:6,padding:"8px 10px",marginBottom:14,fontSize:12,color:C.muted}}>📝 {asset.notes}</div>}

          {/* Service history */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Service History ({asset.history?.length||0})</div>
              {canEdit&&<button onClick={()=>setShowSvcForm(true)} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"3px 10px",fontSize:10}}>+ Log Service</button>}
            </div>
            {(!asset.history||asset.history.length===0)&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>No service records yet.</div>}
            {asset.history&&asset.history.slice(0,4).map(h=>(
              <div key={h.id} style={{background:C.navyLight,borderRadius:7,padding:"9px 12px",marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{h.type} — {h.date}</div>
                  <div style={{fontSize:11,color:C.muted}}>{h.hours}hrs · {h.technician}</div>
                </div>
                <div style={{fontSize:11,color:C.muted}}>{h.desc}</div>
                {h.parts&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>Parts: {h.parts}</div>}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {canEdit&&<button onClick={()=>{openJobForm(null,asset.id);setSelectedAsset(null);}} style={{...btn,background:C.brass,color:C.bg}}>Create Job Card</button>}
            {canEdit&&<button onClick={()=>{openAssetForm(asset);setSelectedAsset(null);}} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Edit Asset</button>}
            {canEdit&&<button onClick={()=>deleteAsset(asset.id,asset.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
          </div>
        </div>

        {/* Service log form inside asset modal */}
        {showSvcForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,padding:16}} onClick={()=>setShowSvcForm(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:440,padding:22}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:15,color:C.navy,marginBottom:14}}>Log Service Record</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <FF label="Date" type="date" value={svcForm.date} onChange={v=>setSvcForm(p=>({...p,date:v}))} half/>
              <FF label="Type" type="select" value={svcForm.type} onChange={v=>setSvcForm(p=>({...p,type:v}))} opts={["Service","Repair","Inspection","Replacement","Other"]} half/>
            </div>
            <FF label="Description" type="textarea" value={svcForm.desc} onChange={v=>setSvcForm(p=>({...p,desc:v}))} rows={2} ph="What was done?"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <FF label="Technician" value={svcForm.technician} onChange={v=>setSvcForm(p=>({...p,technician:v}))} ph="Who did the work?" half/>
              <FF label="Hours Worked" type="number" value={svcForm.hours} onChange={v=>setSvcForm(p=>({...p,hours:Number(v)}))} half/>
            </div>
            <FF label="Parts Used" value={svcForm.parts} onChange={v=>setSvcForm(p=>({...p,parts:v}))} ph="e.g. Oil filter x1, Impeller"/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <input type="checkbox" id="resetH" checked={svcForm.resetHours} onChange={e=>setSvcForm(p=>({...p,resetHours:e.target.checked}))}/>
              <label htmlFor="resetH" style={{fontSize:12,color:C.muted,cursor:"pointer"}}>Reset service interval counter</label>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{addServiceRecord(selectedAsset.id,svcForm);setShowSvcForm(false);setSvcForm({date:TODAY,type:"Service",desc:"",technician:"",hours:0,parts:"",resetHours:true});}}
                style={{...btn,background:C.brass,color:C.bg}}>Save Record</button>
              <button onClick={()=>setShowSvcForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
            </div>
          </div>
        </div>}
      </div>;
    })()}

    {/* ── JOB CARD DETAIL MODAL ──────────────────────────────── */}
    {selectedJob&&(()=>{
      const job=jobs.find(j=>j.id===selectedJob.id)||selectedJob;
      const asset=assets.find(a=>a.id===job.assetId);
      const doneCount=job.checklist.filter(c=>c.done).length;
      const sc=job.status==="Done"?C.greenL:job.status==="In Progress"?C.amber:C.muted;
      const isMine=role===job.assignedTo||["captain","management"].includes(role);
      return <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:1000,padding:16,overflowY:"auto"}} onClick={()=>setSelectedJob(null)}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:560,maxWidth:"95vw",padding:24,marginTop:24}} onClick={e=>e.stopPropagation()}>
          <BackBtn onBack={()=>setSelectedJob(null)} label="Back to Jobs"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{job.id} · {asset?.name||"Unknown Asset"}</div>
              <div style={{fontSize:16,fontWeight:800,color:C.navy,lineHeight:1.2}}>{job.title}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Pill label={job.status} bg={sc+"22"} color={sc} dot/>
              <button onClick={()=>setSelectedJob(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>×</button>
            </div>
          </div>

          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            <Pill label={job.priority} bg={job.priority==="Critical"?"#4a101022":"#3d1a1a"} color={job.priority==="Critical"?C.signal:"#f87171"} small/>
            <Pill label={ROLES[job.assignedTo]?.label} bg={C.navyLight} color={C.muted} small/>
            <Pill label={`Scheduled: ${job.scheduledDate}`} bg={C.navyLight} color={C.muted} small/>
            {job.hoursWorked>0&&<Pill label={`${job.hoursWorked}hrs worked`} bg={C.navyLight} color={C.muted} small/>}
          </div>

          {job.desc&&<div style={{color:C.text,fontSize:13,marginBottom:14,lineHeight:1.6,background:C.navyLight,borderRadius:7,padding:"9px 12px"}}>{job.desc}</div>}

          {/* Checklist */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Checklist</div>
              <div style={{fontSize:11,color:doneCount===job.checklist.length?C.greenL:C.amber,fontWeight:600}}>{doneCount}/{job.checklist.length} complete</div>
            </div>
            <div style={{background:C.navyLight,borderRadius:4,overflow:"hidden",height:4,marginBottom:10}}>
              <div style={{width:`${job.checklist.length?(doneCount/job.checklist.length)*100:0}%`,height:"100%",background:doneCount===job.checklist.length?C.greenL:C.amber,transition:"width .3s"}}/>
            </div>
            {job.checklist.map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <input type="checkbox" checked={item.done} onChange={()=>isMine&&toggleCheckItem(job.id,item.id)}
                  style={{width:16,height:16,cursor:isMine?"pointer":"default",flexShrink:0,accentColor:C.brass}}/>
                <span style={{fontSize:13,color:item.done?C.muted:C.text,textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
              </div>
            ))}
          </div>

          {job.partsUsed?.length>0&&<div style={{background:C.navyLight,borderRadius:6,padding:"8px 10px",marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>Parts Used</div>
            <div style={{fontSize:12,color:C.text}}>{job.partsUsed.join(", ")}</div>
          </div>}

          {job.notes&&<div style={{background:C.navyLight,borderRadius:6,padding:"8px 10px",marginBottom:12,fontSize:12,color:C.muted}}>📝 {job.notes}</div>}

          {job.signedOffBy&&<div style={{fontSize:12,color:C.greenL,marginBottom:12}}>✓ Signed off by {ROLES[job.signedOffBy]?.label}</div>}

          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {isMine&&job.status!=="Done"&&<>
              {job.status!=="In Progress"&&<button onClick={()=>setJobStatus(job.id,"In Progress")} style={{...btn,background:C.amber+"22",color:C.amber}}>Start Job</button>}
              {["captain","management"].includes(role)&&doneCount===job.checklist.length&&<button onClick={()=>signOffJob(job.id)} style={{...btn,background:C.green,color:"white"}}>Sign Off & Complete</button>}
              {role===job.assignedTo&&doneCount===job.checklist.length&&<button onClick={()=>setJobStatus(job.id,"Done")} style={{...btn,background:C.greenL,color:C.bg}}>Mark Done</button>}
            </>}
            {canEdit&&<button onClick={()=>{openJobForm(job,null);setSelectedJob(null);}} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Edit</button>}
            {canEdit&&<button onClick={()=>deleteJob(job.id)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
          </div>
        </div>
      </div>;
    })()}

    {/* ── SERVICE SCHEDULER VIEW ─────────────────────────────── */}

      addTask={task=>setTasks&&setTasks(p=>[task,...p])} />

    {/* ── ASSET FORM ─────────────────────────────────────────── */}
    {showAssetForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowAssetForm(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:560,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:16,color:C.navy,marginBottom:18}}>{editAsset?"Edit Asset":"Add New Asset"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <FF label="Asset Name" value={aForm.name} onChange={v=>setAForm(p=>({...p,name:v}))} req ph="e.g. Starboard Engine"/>
          <FF label="Category" type="select" value={aForm.category} onChange={v=>setAForm(p=>({...p,category:v}))} opts={ASSET_CATS} half/>
          <FF label="Manufacturer" value={aForm.manufacturer} onChange={v=>setAForm(p=>({...p,manufacturer:v}))} half ph="e.g. Volvo Penta"/>
          <FF label="Model" value={aForm.model} onChange={v=>setAForm(p=>({...p,model:v}))} half ph="e.g. D13-S IPS"/>
          <FF label="Serial Number" value={aForm.serial} onChange={v=>setAForm(p=>({...p,serial:v}))} half ph="e.g. VP-0044-2021"/>
          <FF label="Install Date" type="date" value={aForm.installedDate} onChange={v=>setAForm(p=>({...p,installedDate:v}))} half/>
          <FF label="Current Hours" type="number" value={aForm.currentHours} onChange={v=>setAForm(p=>({...p,currentHours:Number(v)}))} half/>
          <FF label="Service Interval (hrs) — 0 = calendar" type="number" value={aForm.serviceIntervalHours} onChange={v=>setAForm(p=>({...p,serviceIntervalHours:Number(v)}))} half/>
          <FF label="Last Service Hours" type="number" value={aForm.lastServiceHours} onChange={v=>setAForm(p=>({...p,lastServiceHours:Number(v)}))} half/>
          <FF label="Last Service Date" type="date" value={aForm.lastServiceDate} onChange={v=>setAForm(p=>({...p,lastServiceDate:v}))} half/>
          <FF label="Notes" type="textarea" value={aForm.notes} onChange={v=>setAForm(p=>({...p,notes:v}))} rows={2}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:6}}>
          <button onClick={saveAsset} style={{...btn,background:C.brass,color:C.bg}}>Save Asset</button>
          <button onClick={()=>setShowAssetForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
          {editAsset&&<button onClick={()=>deleteAsset(editAsset.id,editAsset.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
        </div>
      </div>
    </div>}

    {/* ── JOB CARD FORM ──────────────────────────────────────── */}
    {showJobForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowJobForm(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:540,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:16,color:C.navy,marginBottom:18}}>{editJob?"Edit Job Card":"New Job Card"}</div>
        <FF label="Asset" type="select" value={jForm.assetId} onChange={v=>setJForm(p=>({...p,assetId:v}))}
          opts={[{v:"",l:"Select asset..."}, ...assets.map(a=>({v:a.id,l:a.name}))]}/>
        <FF label="Job Title" value={jForm.title} onChange={v=>setJForm(p=>({...p,title:v}))} req ph="e.g. 250hr generator service"/>
        <FF label="Description" type="textarea" value={jForm.desc} onChange={v=>setJForm(p=>({...p,desc:v}))} rows={2}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <FF label="Assign To" type="select" value={jForm.assignedTo} onChange={v=>setJForm(p=>({...p,assignedTo:v}))}
            opts={["engineer","deckhand","captain"].map(r=>({v:r,l:`${ROLES[r].icon} ${ROLES[r].label}`}))} half/>
          <FF label="Priority" type="select" value={jForm.priority} onChange={v=>setJForm(p=>({...p,priority:v}))} opts={["Critical","High","Medium","Low"]} half/>
          <FF label="Scheduled Date" type="date" value={jForm.scheduledDate} onChange={v=>setJForm(p=>({...p,scheduledDate:v}))} half/>
          <FF label="Hours Worked" type="number" value={jForm.hoursWorked} onChange={v=>setJForm(p=>({...p,hoursWorked:Number(v)}))} half/>
        </div>
        {/* Checklist editor */}
        <div style={{marginBottom:12}}>
          <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Checklist Items</label>
          {jForm.checklist.map((item,i)=>(
            <div key={item.id} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <input value={item.text} onChange={e=>{const c=[...jForm.checklist];c[i]={...c[i],text:e.target.value};setJForm(p=>({...p,checklist:c}));}}
                style={{...inp,flex:1,padding:"6px 10px"}} placeholder={`Step ${i+1}…`}/>
              <button onClick={()=>setJForm(p=>({...p,checklist:p.checklist.filter((_,j)=>j!==i)}))}
                style={{background:C.signal+"22",border:"none",color:C.signal,borderRadius:5,width:28,height:28,cursor:"pointer",flexShrink:0}}>×</button>
            </div>
          ))}
          <button onClick={()=>setJForm(p=>({...p,checklist:[...p.checklist,{id:`c${Date.now()}`,text:"",done:false}]}))}
            style={{...btn,background:C.navyLight,color:C.muted,border:`1px dashed ${C.border}`,padding:"4px 12px",fontSize:11}}>+ Add Step</button>
        </div>
        <FF label="Parts / Materials" value={Array.isArray(jForm.partsUsed)?jForm.partsUsed.join(", "):""} onChange={v=>setJForm(p=>({...p,partsUsed:v.split(",").map(s=>s.trim()).filter(Boolean)}))} ph="e.g. Oil filter x1, Impeller"/>
        <FF label="Notes" type="textarea" value={jForm.notes} onChange={v=>setJForm(p=>({...p,notes:v}))} rows={2}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={saveJob} style={{...btn,background:C.brass,color:C.bg}}>Save Job Card</button>
          <button onClick={()=>setShowJobForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
        </div>
      </div>
    </div>}
    {["captain","management","engineer"].includes(role)&&<FloatingAI label="Maintenance" color={C.blue}><AIMaintenanceModule assets={assets} jobs={jobs} tasks={[]} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4 — INVENTORY MODULE
// ═══════════════════════════════════════════════════════════════

const INV_GROUPS = {
  Food: {
    icon:"🍽️", IconC:ChefHat, color:"#e07b39",
    cats:["Fresh","Frozen","Dry Storage","Beverages"],
  },
  Cleaning: {
    icon:"🧹", IconC:Waves, color:"#3b9fd4",
    cats:["Chemicals","Laundry","Consumables","Equipment"],
  },
  Alcohol: {
    icon:"🍷", IconC:Coffee, color:"#9b59b6",
    cats:["Wine","Spirits","Beer","Champagne","Bar Stock"],
  },
  Engineering: {
    icon:"⚙️", IconC:Wrench, color:"#6b8cba",
    cats:["Spare Parts","Filters","Oils","Tools","Critical Spares"],
  },
  Deck: {
    icon:"⚓", IconC:Anchor, color:"#25b085",
    cats:["Safety Equipment","Mooring Equipment","Water Toys","Exterior Equipment","Consumables"],
  },
};

// Flat list of all subcategories (for dropdowns & legacy compat)
const INV_CATS = Object.values(INV_GROUPS).flatMap(g=>g.cats);

// Which group does a category belong to?
function catGroup(cat) {
  return Object.entries(INV_GROUPS).find(([,g])=>g.cats.includes(cat))?.[0]||null;
}

const INIT_INVENTORY = [
  {id:"i1", name:"Engine Oil — 15W-40",              category:"Oils",            unit:"L",     qty:45, minQty:20, location:"Engine Room",      supplier:"Marine Store Dubai",  lastOrdered:d3(-14),  reorderQty:40, notes:""},
  {id:"i2", name:"Coolant — OAT",                    category:"Oils",            unit:"L",     qty:8,  minQty:10, location:"Engine Room",      supplier:"Marine Store Dubai",  lastOrdered:d3(-30),  reorderQty:20, notes:"LOW STOCK"},
  {id:"i3", name:"Hydraulic Fluid",                   category:"Oils",            unit:"L",     qty:25, minQty:10, location:"Engine Room",      supplier:"Marine Store Dubai",  lastOrdered:d3(-20),  reorderQty:20, notes:""},
  {id:"i4", name:"Impeller — Volvo",                  category:"Spare Parts",     unit:"Units", qty:2,  minQty:2,  location:"Spare Parts Store",supplier:"Volvo Penta UAE",     lastOrdered:d3(-60),  reorderQty:3,  notes:""},
  {id:"i5", name:"Oil Filter — Generator",            category:"Critical Spares", unit:"Units", qty:0,  minQty:3,  location:"Spare Parts Store",supplier:"Northern Lights",     lastOrdered:d3(-45),  reorderQty:5,  notes:"OUT OF STOCK — order immediately"},
  {id:"i6", name:"Boat Soap",                         category:"Exterior Equipment",unit:"L",   qty:3,  minQty:5,  location:"Deck Store",       supplier:"Marine Clean Dubai",  lastOrdered:d3(-10),  reorderQty:10, notes:""},
  {id:"i7", name:"Teak Cleaner",                      category:"Exterior Equipment",unit:"L",   qty:6,  minQty:4,  location:"Deck Store",       supplier:"Marine Clean Dubai",  lastOrdered:d3(-7),   reorderQty:8,  notes:""},
  {id:"i8", name:"Stainless Polish",                  category:"Exterior Equipment",unit:"Cans",qty:12, minQty:4,  location:"Deck Store",       supplier:"Marine Clean Dubai",  lastOrdered:d3(-14),  reorderQty:12, notes:""},
  {id:"i9", name:"Molton Brown Toiletries — Guest Set",category:"Consumables",    unit:"Sets",  qty:4,  minQty:8,  location:"Stew Store",       supplier:"Molton Brown UAE",    lastOrdered:d3(-7),   reorderQty:12, notes:"LOW — reorder before owner arrival"},
  {id:"i10",name:"Guest Slippers",                    category:"Consumables",     unit:"Pairs", qty:4,  minQty:8,  location:"Stew Store",       supplier:"Various",             lastOrdered:d3(-30),  reorderQty:10, notes:""},
  {id:"i11",name:"Laundry Detergent",                 category:"Laundry",         unit:"L",     qty:8,  minQty:5,  location:"Laundry Room",     supplier:"Marine Store Dubai",  lastOrdered:d3(-14),  reorderQty:10, notes:""},
  {id:"i12",name:"Dishwasher Tablets",                category:"Chemicals",       unit:"Boxes", qty:3,  minQty:2,  location:"Galley Store",     supplier:"Carrefour Dubai",     lastOrdered:d3(-10),  reorderQty:4,  notes:""},
  {id:"i13",name:"Olive Oil — Extra Virgin",          category:"Dry Storage",     unit:"L",     qty:4,  minQty:2,  location:"Galley Dry Store", supplier:"Carrefour Dubai",     lastOrdered:d3(-5),   reorderQty:6,  notes:""},
  {id:"i14",name:"Fresh Water — Bottles 1.5L",        category:"Beverages",       unit:"Cases", qty:24, minQty:20, location:"Galley Store",     supplier:"Carrefour Dubai",     lastOrdered:d3(-3),   reorderQty:24, notes:""},
  {id:"i15",name:"Life Jacket — Adult",               category:"Safety Equipment",unit:"Units", qty:12, minQty:12, location:"Safety Locker",    supplier:"Marine Safety UAE",   lastOrdered:d3(-365), reorderQty:0,  notes:"Annual check due"},
  {id:"i16",name:"Flares — SOLAS Kit",               category:"Safety Equipment",unit:"Sets",  qty:2,  minQty:2,  location:"Safety Locker",    supplier:"Marine Safety UAE",   lastOrdered:d3(-180), reorderQty:0,  notes:"Check expiry dates"},
  {id:"i17",name:"First Aid Kit",                     category:"Safety Equipment",unit:"Units", qty:1,  minQty:1,  location:"Crew Mess",        supplier:"Marine Safety UAE",   lastOrdered:d3(-90),  reorderQty:0,  notes:""},
  {id:"i18",name:"Coffee Beans — Guest",              category:"Beverages",       unit:"Kg",    qty:2,  minQty:1,  location:"Galley Store",     supplier:"Carrefour Dubai",     lastOrdered:d3(-7),   reorderQty:3,  notes:""},
  {id:"i19",name:"Red Wine — House",                  category:"Wine",            unit:"Bottles",qty:24,minQty:12, location:"Wine Store",       supplier:"MMI Dubai",           lastOrdered:d3(-7),   reorderQty:12, notes:""},
  {id:"i20",name:"Champagne — Moët",                  category:"Champagne",       unit:"Bottles",qty:6, minQty:6,  location:"Wine Store",       supplier:"MMI Dubai",           lastOrdered:d3(-14),  reorderQty:6,  notes:""},
  {id:"i21",name:"Grey Goose Vodka",                  category:"Spirits",         unit:"Bottles",qty:3, minQty:2,  location:"Bar Store",        supplier:"MMI Dubai",           lastOrdered:d3(-10),  reorderQty:3,  notes:""},
  {id:"i22",name:"Mooring Lines — 20m",               category:"Mooring Equipment",unit:"Units",qty:4, minQty:4,  location:"Foredeck Store",   supplier:"Marine Store Dubai",  lastOrdered:d3(-90),  reorderQty:0,  notes:""},
  {id:"i23",name:"Fenders — Large",                   category:"Mooring Equipment",unit:"Units",qty:6, minQty:6,  location:"Foredeck Store",   supplier:"Marine Store Dubai",  lastOrdered:d3(-120), reorderQty:0,  notes:""},
  {id:"i24",name:"Jet Ski Fuel",                      category:"Water Toys",      unit:"L",     qty:40, minQty:20, location:"Toy Store",        supplier:"ENOC",                lastOrdered:d3(-5),   reorderQty:40, notes:""},
  {id:"i25",name:"Fresh Salmon",                      category:"Fresh",           unit:"Kg",    qty:3,  minQty:2,  location:"Fridge",           supplier:"Fish Market",         lastOrdered:d3(-1),   reorderQty:4,  notes:""},
  {id:"i26",name:"Frozen Chicken Breast",             category:"Frozen",          unit:"Kg",    qty:5,  minQty:3,  location:"Freezer",          supplier:"Carrefour Dubai",     lastOrdered:d3(-3),   reorderQty:6,  notes:""},
  {id:"i27",name:"Air Filter — Main Engine",          category:"Filters",         unit:"Units", qty:1,  minQty:2,  location:"Engine Room",      supplier:"Marine Store Dubai",  lastOrdered:d3(-60),  reorderQty:2,  notes:"LOW STOCK"},
  {id:"i28",name:"Deck Scrubber Pads",                category:"Consumables",     unit:"Units", qty:8,  minQty:6,  location:"Deck Store",       supplier:"Marine Clean Dubai",  lastOrdered:d3(-14),  reorderQty:10, notes:""},
];


// ── INVENTORY DEPARTMENT MAP ─────────────────────────────────
const DEPT_MAP = {
  "Chef":       ["Galley","Guest Supplies"],
  "Steward":    ["Cleaning","Guest Supplies","Galley"],
  "Engineer":   ["Engineering","Spare Parts","Safety"],
  "Deck":       ["Deck","Navigation","Safety"],
};

// ── INVENTORY EXPORT ENGINE ──────────────────────────────────
async function ensureSheetJS() {
  if(window.XLSX) return window.XLSX;
  return new Promise((res,rej)=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload=()=>res(window.XLSX); s.onerror=()=>rej(new Error("SheetJS load failed"));
    document.head.appendChild(s);
  });
}

function buildExportRows(items, dept) {
  return items.map(i=>({
    "Item Name":          i.name,
    "Category":           i.category,
    "Department":         dept||"All",
    "Qty Onboard":        i.qty,
    "Unit":               i.unit,
    "Min Stock Level":    i.minQty||0,
    "Reorder Threshold":  i.reorderQty||0,
    "Stock Status":       i.qty===0?"Out of Stock":i.minQty>0&&i.qty<i.minQty?"Low Stock":"OK",
    "Location":           i.location||"",
    "Supplier":           i.supplier||"",
    "Last Updated":       i.lastOrdered||"—",
    "Notes":              i.notes||"",
  }));
}

async function exportXLSX(items, filename, dept) {
  const XLSX = await ensureSheetJS();
  const rows = buildExportRows(items, dept);
  const ws   = XLSX.utils.json_to_sheet(rows);
  // Column widths
  ws["!cols"] = [28,16,14,12,8,14,16,14,18,20,14,24].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, dept||"Inventory");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function exportCSV(items, filename, dept) {
  const rows  = buildExportRows(items, dept);
  const heads = Object.keys(rows[0]);
  const csv   = [heads.join(","), ...rows.map(r=>heads.map(h=>`"${String(r[h]).replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob  = new Blob([csv],{type:"text/csv"});
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a"); a.href=url; a.download=`${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

async function exportPDF(items, filename, dept, subtitle) {
  // Build a printable HTML page and trigger browser print-to-PDF
  const rows  = buildExportRows(items, dept);
  const heads = Object.keys(rows[0]);
  const today = new Date().toLocaleDateString("en-AE",{day:"2-digit",month:"short",year:"numeric"});
  const statusColor = s => s==="Out of Stock"?"#cf4338":s==="Low Stock"?"#e0b84a":"#25b085";
  const rowsHTML = rows.map((r,i)=>`
    <tr style="background:${i%2===0?"#0d1929":"#101e33"}">
      ${heads.map(h=>`<td style="padding:6px 8px;border-bottom:1px solid #1a2a45;${h==="Stock Status"?`color:${statusColor(r[h])};font-weight:600`:h==="Qty Onboard"?"font-weight:700;text-align:center":""};">${r[h]}</td>`).join("")}
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>${filename}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#07101f;color:#e8ecf4;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;padding:20px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #c9a84c;}
    .logo{font-size:20px;font-weight:900;color:#fff;letter-spacing:2px;font-family:Georgia,serif;}
    .logo span{color:#c9a84c;}
    .meta{text-align:right;font-size:10px;color:#6b7f99;}
    h2{font-size:15px;font-weight:800;color:#fff;margin-bottom:2px;}
    .subtitle{font-size:11px;color:#6b7f99;margin-bottom:14px;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#111e30;}
    th{padding:8px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:#6b7f99;font-weight:700;border-bottom:2px solid #1a2a45;}
    .summary{display:flex;gap:16px;margin-bottom:14px;}
    .stat{background:#111e30;border:1px solid #1a2a45;border-radius:6px;padding:8px 14px;}
    .stat-n{font-size:18px;font-weight:800;color:#c9a84c;}
    .stat-l{font-size:9px;color:#6b7f99;text-transform:uppercase;letter-spacing:.8px;}
    @media print{body{background:#fff!important;color:#000!important;}
      table tr{background:white!important;}
      td,th{border-color:#ddd!important;color:#000!important;}
      .stat{background:#f5f5f5!important;border-color:#ddd!important;}
      .stat-n{color:#000!important;} .logo{color:#000!important;} .logo span{color:#c9a84c;}}
  </style></head><body>
  <div class="header">
    <div><div class="logo">⚓ BRIDGE<span> ·</span></div><div style="font-size:10px;color:#6b7f99;margin-top:3px;">Yacht Operations Platform</div></div>
    <div class="meta"><div>${today}</div><div>${filename}</div></div>
  </div>
  <h2>${dept||"Full"} Inventory Report</h2>
  <div class="subtitle">${subtitle||""} · ${rows.length} items</div>
  <div class="summary">
    <div class="stat"><div class="stat-n">${rows.length}</div><div class="stat-l">Total Items</div></div>
    <div class="stat"><div class="stat-n" style="color:#cf4338">${rows.filter(r=>r["Stock Status"]==="Out of Stock").length}</div><div class="stat-l">Out of Stock</div></div>
    <div class="stat"><div class="stat-n" style="color:#e0b84a">${rows.filter(r=>r["Stock Status"]==="Low Stock").length}</div><div class="stat-l">Low Stock</div></div>
    <div class="stat"><div class="stat-n" style="color:#25b085">${rows.filter(r=>r["Stock Status"]==="OK").length}</div><div class="stat-l">OK</div></div>
  </div>
  <table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rowsHTML}</tbody></table>
  <div style="margin-top:18px;font-size:9px;color:#6b7f99;border-top:1px solid #1a2a45;padding-top:10px;">
    Generated by Bridge Yacht Operations · ${today} · Confidential
  </div>
  </body></html>`;

  const w = window.open("","_blank","width=1000,height=700");
  w.document.write(html);
  w.document.close();
  w.onload = ()=>{ w.focus(); w.print(); };
}

function InventoryModule({inventory,setInventory,role,logAudit}) {
  const logI = (action,detail) => logAudit&&logAudit(action,detail,"Inventory");
  const [catFilter,setCatFilter]   = useState("All");
  const [groupFilter,setGroupFilter] = useState("All"); // new top-level group
  const [search,setSearch]         = useState("");
  const [showLowOnly,setShowLowOnly] = useState(false);
  const [sortBy,setSortBy]         = useState("name");
  const [showForm,setShowForm]     = useState(false);
  const [editItem,setEditItem]     = useState(null);
  const [bulkInv,setBulkInv]       = useState([]);
  const [form,setForm]             = useState({name:"",category:"Engineering",unit:"Units",qty:0,minQty:0,location:"",supplier:"",reorderQty:0,notes:""});

  // ── Excel Import state ───────────────────────────────────────
  const [showImport,setShowImport]   = useState(false);
  const [importing,setImporting]     = useState(false);
  const [importRows,setImportRows]   = useState([]); // parsed & AI-mapped rows
  const [importError,setImportError] = useState(null);
  const [importStep,setImportStep]   = useState("upload"); // upload | review | done
  const fileRef = useRef(null);

  const canEdit = ["captain","management","engineer","stew","chef"].includes(role);

  // ── Excel parser using SheetJS ───────────────────────────────
  async function loadSheetJS() {
    if(window.XLSX) return window.XLSX;
    return new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload=()=>res(window.XLSX);
      s.onerror=()=>rej(new Error("Failed to load SheetJS"));
      document.head.appendChild(s);
    });
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if(!file) return;
    setImporting(true); setImportError(null); setImportRows([]);

    try {
      const XLSX = await loadSheetJS();
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, {type:"array"});
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, {defval:""});

      if(!raw.length) throw new Error("No data found in spreadsheet.");

      // Send first 60 rows + headers to Claude for mapping
      const headers = Object.keys(raw[0]);
      const preview = raw.slice(0,60);

      const prompt = `You are an inventory data mapper for a yacht management system.

The user uploaded a spreadsheet. Here are the column headers and first rows:

HEADERS: ${JSON.stringify(headers)}
ROWS (first ${preview.length}): ${JSON.stringify(preview)}

Map each row to this inventory schema. Use your best judgment for each field.
Categories must be one of: Engineering, Spare Parts, Deck, Guest Supplies, Cleaning, Galley, Safety, Navigation, Other.
Units must be one of: Units, L, Kg, Cans, Boxes, Sets, Pairs, Cases, Rolls, Metres.

Respond ONLY with a JSON array — no markdown, no explanation:
[
  {
    "name": "item name (required)",
    "category": "best matching category",
    "unit": "best matching unit",
    "qty": 0,
    "minQty": 0,
    "location": "location if available else empty string",
    "supplier": "supplier if available else empty string",
    "reorderQty": 0,
    "notes": "any relevant notes"
  }
]

Rules:
- qty, minQty, reorderQty must be numbers (default 0 if not found)
- Skip rows that are clearly headers, totals, or blank
- name is required — skip rows without a recognisable item name
- Include ALL valid item rows`;

      const res  = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:4000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"[]";
      const clean = text.replace(/```json|```/g,"").trim();
      const mapped = JSON.parse(clean);

      // Add review flags
      const rows = mapped.map((r,i)=>({
        ...r,
        _id: `imp_${i}`,
        _selected: true,
        _qty: r.qty||0,
      }));

      setImportRows(rows);
      setImportStep("review");
    } catch(e) {
      setImportError(e.message||"Failed to process file. Try a .xlsx or .csv file.");
    }
    setImporting(false);
    if(fileRef.current) fileRef.current.value="";
  }

  function confirmImport() {
    const toAdd = importRows
      .filter(r=>r._selected)
      .map(({_id,_selected,_qty,...r})=>({
        ...r,
        qty: _qty,
        id: `i${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        lastOrdered:"—",
      }));
    setInventory(p=>[...p,...toAdd]);
    logI("Inventory Imported",`${toAdd.length} items imported from spreadsheet`);
    setShowImport(false);
    setImportStep("upload");
    setImportRows([]);
  }

  const [showExport,setShowExport]   = useState(false);
  const [exportDept,setExportDept]   = useState("All");
  const [exportFilter,setExportFilter] = useState("all"); // all|low|critical|category
  const [exportCat,setExportCat]     = useState("All");
  const [exporting,setExporting]     = useState(false);

  // ── Export helpers ───────────────────────────────────────────
  function getExportItems() {
    let items = [...inventory];
    // Department filter
    if(exportDept!=="All") {
      const cats = DEPT_MAP[exportDept]||[];
      items = items.filter(i=>cats.includes(i.category));
    }
    // Category filter
    if(exportFilter==="category"&&exportCat!=="All") {
      items = items.filter(i=>i.category===exportCat);
    }
    // Stock filter
    if(exportFilter==="low")      items = items.filter(i=>i.minQty>0&&i.qty<i.minQty&&i.qty>0);
    if(exportFilter==="critical") items = items.filter(i=>i.qty===0);
    return items;
  }

  async function doExport(fmt) {
    const items = getExportItems();
    if(!items.length) { alert("No items match the selected filters."); return; }
    setExporting(true);
    const deptLabel = exportDept==="All"?"Full Inventory":`${exportDept} Department`;
    const filterLabel = exportFilter==="low"?"Low Stock":exportFilter==="critical"?"Critical/Out of Stock":exportFilter==="category"?exportCat:"All Items";
    const filename = `Bridge_Inventory_${exportDept}_${filterLabel}_${TODAY}`.replace(/[^a-z0-9_-]/gi,"_");
    const subtitle = `${deptLabel} · ${filterLabel}`;
    try {
      if(fmt==="xlsx") await exportXLSX(items, filename, deptLabel);
      if(fmt==="csv")  exportCSV(items, filename, deptLabel);
      if(fmt==="pdf")  await exportPDF(items, filename, deptLabel, subtitle);
      logI("Inventory Exported",`${deptLabel} — ${filterLabel} — ${fmt.toUpperCase()} (${items.length} items)`);
    } catch(e) { alert("Export failed: "+e.message); }
    setExporting(false);
    setShowExport(false);
  }
  const outOfStock = inventory.filter(i=>i.qty===0);
  const lowStock   = inventory.filter(i=>i.minQty>0 && i.qty<i.minQty);

  const visible = inventory.filter(i=>{
    if(groupFilter!=="All" && catGroup(i.category)!==groupFilter) return false;
    if(catFilter!=="All" && i.category!==catFilter) return false;
    if(showLowOnly && i.qty>=i.minQty) return false;
    if(search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="name")     return a.name.localeCompare(b.name);
    if(sortBy==="qty")      return a.qty-b.qty;
    if(sortBy==="category") return a.category.localeCompare(b.category);
    if(sortBy==="stock") {
      const aLow=a.minQty>0&&a.qty<a.minQty; const bLow=b.minQty>0&&b.qty<b.minQty;
      return bLow-aLow;
    }
    return 0;
  });

  function adjust(id,delta){
    setInventory(p=>p.map(i=>{
      if(i.id!==id) return i;
      const newQty=Math.max(0,i.qty+delta);
      logI("Inventory Adjusted",`${i.name}: ${i.qty} -> ${newQty} ${i.unit}`);
      return {...i,qty:newQty};
    }));
  }

  function openForm(item){
    setEditItem(item||null);
    setForm(item?{...item}:{name:"",category:"Engineering",unit:"Units",qty:0,minQty:0,location:"",supplier:"",reorderQty:0,notes:""});
    setShowForm(true);
  }

  function save(){
    if(!form.name) return;
    if(editItem){
      setInventory(p=>p.map(i=>i.id===editItem.id?{...i,...form}:i));
      logI("Inventory Updated",`${form.name} — updated`);
    } else {
      setInventory(p=>[...p,{...form,id:`i${Date.now()}`,lastOrdered:"—"}]);
      logI("Inventory Added",`${form.name} added (${form.category})`);
    }
    setShowForm(false);
  }

  function del(id,name){
    setInventory(p=>p.filter(i=>i.id!==id));
    logI("Inventory Deleted",`${name} removed`);
    setShowForm(false);
  }

  function bulkInvAct(action){
    if(action==="zero"){
      setInventory(p=>p.map(i=>bulkInv.includes(i.id)?{...i,qty:0}:i));
      logI("Inventory Adjusted",`${bulkInv.length} items zeroed`);
    }
    if(action==="reorder"){
      setInventory(p=>p.map(i=>bulkInv.includes(i.id)?{...i,qty:i.qty+i.reorderQty,lastOrdered:TODAY}:i));
      logI("Inventory Restocked",`${bulkInv.length} items restocked to reorder quantity`);
    }
    if(action==="delete"){
      setInventory(p=>p.filter(i=>!bulkInv.includes(i.id)));
      logI("Inventory Deleted",`${bulkInv.length} items bulk deleted`);
    }
    setBulkInv([]);
  }

  function stockColor(item){
    if(item.qty===0) return C.signal;
    if(item.minQty>0&&item.qty<item.minQty) return C.amber;
    return C.greenL;
  }

  function stockPct(item){
    if(!item.minQty) return 100;
    return Math.min(100,Math.round((item.qty/item.minQty)*100));
  }

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {canEdit&&<input type="checkbox" title="Select all" checked={bulkInv.length===visible.length&&visible.length>0}
          onChange={()=>setBulkInv(bulkInv.length===visible.length?[]:visible.map(i=>i.id))}
          style={{cursor:"pointer",width:16,height:16}}/>}
        <div>


      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Inventory <span style={{color:C.muted,fontSize:14,fontWeight:400}}>({visible.length}/{inventory.length})</span></div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{outOfStock.length} out of stock · {lowStock.length} low stock</div>
        </div>
      </div>
      {canEdit&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>{setShowImport(true);setImportStep("upload");setImportRows([]);setImportError(null);}}
          style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Import</button>
        <button onClick={()=>setShowExport(true)}
          style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Export</button>
        <button onClick={()=>openForm(null)} style={{...btn,background:C.brass,color:C.bg}}>+ Add Item</button>
      </div>}
    </div>

    {/* Alert panels */}
    {(outOfStock.length>0||lowStock.length>0)&&<div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
      {outOfStock.length>0&&<div onClick={()=>{setShowLowOnly(true);setSearch("");}} style={{background:C.signal+"12",border:`1px solid ${C.signal}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:160,cursor:"pointer"}}>
        <div style={{fontWeight:700,color:C.signal,fontSize:12,marginBottom:4}}>Out of Stock ({outOfStock.length})</div>
        {outOfStock.slice(0,3).map(i=><div key={i.id} style={{fontSize:11,color:C.muted}}>{i.name}</div>)}
        {outOfStock.length>3&&<div style={{fontSize:10,color:C.signal}}>+{outOfStock.length-3} more</div>}
      </div>}
      {lowStock.filter(i=>i.qty>0).length>0&&<div onClick={()=>{setShowLowOnly(true);setSearch("");}} style={{background:C.amber+"12",border:`1px solid ${C.amber}44`,borderRadius:9,padding:"10px 14px",flex:1,minWidth:160,cursor:"pointer"}}>
        <div style={{fontWeight:700,color:C.amber,fontSize:12,marginBottom:4}}>Low Stock ({lowStock.filter(i=>i.qty>0).length})</div>
        {lowStock.filter(i=>i.qty>0).slice(0,3).map(i=><div key={i.id} style={{fontSize:11,color:C.muted}}>{i.name} — {i.qty} {i.unit}</div>)}
      </div>}
    </div>}

    {/* Bulk bar */}
    {bulkInv.length>0&&<div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:C.brass,fontWeight:700}}>{bulkInv.length} items selected</div>
      <div style={{width:1,height:20,background:C.border}}/>
      <button onClick={()=>bulkInvAct("reorder")} style={{...btn,background:C.green+"22",color:C.greenL,padding:"5px 12px",fontSize:11,border:`1px solid ${C.green}44`}}>Restock All</button>
      <button onClick={()=>bulkInvAct("zero")} style={{...btn,background:C.amber+"22",color:C.amber,padding:"5px 12px",fontSize:11,border:`1px solid ${C.amber}44`}}>Set to Zero</button>
      <button onClick={()=>bulkInvAct("delete")} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 12px",fontSize:11,border:`1px solid ${C.signal}44`}}>Delete Selected</button>
      <button onClick={()=>setBulkInv([])} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 12px",fontSize:11}}>✕ Clear</button>
    </div>}

    {/* ── GROUP TABS ── */}
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      <button onClick={()=>{setGroupFilter("All");setCatFilter("All");}}
        style={{...btn,background:groupFilter==="All"?C.brass:C.navyLight,color:groupFilter==="All"?C.bg:C.muted,
          border:`1px solid ${groupFilter==="All"?C.brass:C.border}`,padding:"6px 13px",fontSize:12,fontWeight:groupFilter==="All"?700:400}}>
        {"All"}
      </button>
      {Object.entries(INV_GROUPS).map(([grp,info])=>{
        const grpItems = inventory.filter(i=>catGroup(i.category)===grp);
        const hasAlert = grpItems.some(i=>i.qty===0||(i.minQty>0&&i.qty<i.minQty));
        return <button key={grp} onClick={()=>{setGroupFilter(grp);setCatFilter("All");}}
          style={{...btn,background:groupFilter===grp?`${info.color}22`:C.navyLight,
            color:groupFilter===grp?info.color:C.muted,
            border:`1px solid ${groupFilter===grp?info.color+"66":C.border}`,
            padding:"6px 13px",fontSize:12,fontWeight:groupFilter===grp?700:400,position:"relative"}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}>{info.IconC&&<Ico i={info.IconC} s={12} c={groupFilter===grp?info.color:C.muted}/>}{grp}</span>
          <span style={{marginLeft:5,fontSize:10,opacity:.7}}>({grpItems.length})</span>
          {hasAlert&&<span style={{position:"absolute",top:3,right:3,width:6,height:6,borderRadius:"50%",background:C.signal}}/>}
        </button>;
      })}
    </div>

    {/* ── CATEGORY SUMMARY CARDS ── */}
    {groupFilter!=="All"&&<div style={{marginBottom:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:7,marginBottom:8}}>
        {(INV_GROUPS[groupFilter]?.cats||[]).map(cat=>{
          const items    = inventory.filter(i=>i.category===cat);
          const low      = items.filter(i=>i.minQty>0&&i.qty<i.minQty&&i.qty>0);
          const critical = items.filter(i=>i.qty===0);
          const col      = INV_GROUPS[groupFilter].color;
          const isActive = catFilter===cat;
          return <div key={cat} onClick={()=>setCatFilter(isActive?"All":cat)}
            style={{background:isActive?`${col}18`:C.card,
              border:`1px solid ${isActive?col+"55":critical.length>0?C.signal+"55":low.length>0?C.amber+"44":C.border}`,
              borderLeft:`3px solid ${critical.length>0?C.signal:low.length>0?C.amber:isActive?col:C.border}`,
              borderRadius:9,padding:"9px 11px",cursor:"pointer",transition:"all .15s",userSelect:"none"}}>
            <div style={{fontSize:11,fontWeight:600,color:isActive?col:C.text,marginBottom:5,lineHeight:1.2}}>{cat}</div>
            <div style={{fontSize:22,fontWeight:900,color:C.navy,lineHeight:1,marginBottom:5}}>{items.length}</div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {critical.length>0&&<div style={{fontSize:9,color:C.signal,fontWeight:700}}>⚠ {critical.length} critical</div>}
              {low.length>0&&<div style={{fontSize:9,color:C.amber,fontWeight:600}}>{low.length} low</div>}
              {critical.length===0&&low.length===0&&items.length>0&&<div style={{fontSize:9,color:C.greenL}}>✓ Stocked</div>}
              {items.length===0&&<div style={{fontSize:9,color:C.muted}}>No items</div>}
            </div>
          </div>;
        })}
      </div>
      {catFilter!=="All"&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
        <span style={{fontSize:11,color:C.muted}}>Filtered:</span>
        <span style={{fontSize:11,fontWeight:700,color:INV_GROUPS[groupFilter]?.color,background:`${INV_GROUPS[groupFilter]?.color}18`,padding:"3px 10px",borderRadius:12,border:`1px solid ${INV_GROUPS[groupFilter]?.color}44`}}>{catFilter}</span>
        <button onClick={()=>setCatFilter("All")} style={{...btn,background:"transparent",border:"none",color:C.signal,fontSize:11,padding:"2px 6px"}}>✕</button>
      </div>}
    </div>}

    {/* Filters */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items, location…"
        style={{...inp,width:200,padding:"6px 10px",fontSize:12}}/>
      <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none"}}>
        <option value="All">All Categories</option>
        {(groupFilter==="All"?INV_CATS:INV_GROUPS[groupFilter]?.cats||[]).map(c=><option key={c}>{c}</option>)}
      </select>
      <button onClick={()=>setShowLowOnly(p=>!p)} style={{...btn,background:showLowOnly?C.amber:C.navyLight,color:showLowOnly?C.bg:C.muted,border:`1px solid ${showLowOnly?C.amber:C.border}`,padding:"5px 12px",fontSize:11}}>
        {showLowOnly?"✕ Low Stock":"Low Stock Only"}
      </button>
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...inp,width:"auto",padding:"6px 10px",fontSize:11,flex:"none",borderColor:C.brass+"55"}}>
        {[["name","Sort: Name"],["qty","Sort: Quantity"],["stock","Sort: Stock Level"],["category","Sort: Category"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
      {(search||catFilter!=="All"||showLowOnly||groupFilter!=="All")&&<button onClick={()=>{setSearch("");setCatFilter("All");setShowLowOnly(false);setGroupFilter("All");}} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕ Clear All</button>}
    </div>

    {/* Inventory grid */}
    {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Package} s={28} c={C.muted}/></div>No items match.</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
      {visible.map(item=>{
        const sc=stockColor(item);
        const pct=stockPct(item);
        const isLow=item.minQty>0&&item.qty<item.minQty;
        const isSelected=bulkInv.includes(item.id);
        return <div key={item.id} style={{background:isSelected?C.navyMid:C.card,border:`1px solid ${isSelected?C.brass:isLow?C.amber+"55":C.border}`,borderLeft:`3px solid ${sc}`,borderRadius:9,padding:14,transition:"background .15s,border .15s",position:"relative"}}>
          {canEdit&&<div style={{position:"absolute",top:10,right:10}} onClick={()=>setBulkInv(p=>p.includes(item.id)?p.filter(x=>x!==item.id):[...p,item.id])}>
            <input type="checkbox" checked={isSelected} readOnly style={{cursor:"pointer"}}/>
          </div>}
          <div style={{marginBottom:8,paddingRight:20}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2,display:"flex",alignItems:"center",gap:5}}>
              {(()=>{const g=catGroup(item.category);const info=INV_GROUPS[g];return info?<span style={{width:6,height:6,borderRadius:"50%",background:info.color,flexShrink:0,display:"inline-block"}}/>:null;})()}
              {item.category}
            </div>
            <div style={{fontWeight:600,color:C.text,fontSize:13,lineHeight:1.3}}>{item.name}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:1}}>{item.location}</div>
          </div>

          {/* Qty controls */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <button onClick={()=>adjust(item.id,-1)} style={{background:C.navyLight,border:`1px solid ${C.border}`,color:C.text,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:16,flexShrink:0}}>−</button>
            <div style={{flex:1,textAlign:"center"}}>
              <span style={{fontSize:22,fontWeight:800,color:sc,fontFamily:"monospace"}}>{item.qty}</span>
              <span style={{fontSize:11,color:C.muted}}> {item.unit}</span>
            </div>
            <button onClick={()=>adjust(item.id,1)} style={{background:C.navyLight,border:`1px solid ${C.border}`,color:C.text,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:16,flexShrink:0}}>+</button>
          </div>

          {/* Stock bar */}
          {item.minQty>0&&<>
            <div style={{background:C.navyLight,borderRadius:3,overflow:"hidden",height:4,marginBottom:3}}>
              <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:sc,transition:"width .3s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:9,color:isLow?sc:C.muted}}>{isLow?item.qty===0?"OUT OF STOCK":"LOW STOCK":""}</span>
              <span style={{fontSize:9,color:C.muted}}>Min: {item.minQty} {item.unit}</span>
            </div>
          </>}

          {item.notes&&<div style={{fontSize:10,color:C.amber,marginTop:4,fontStyle:"italic"}}>{item.notes}</div>}

          {/* Quick restock if low */}
          {isLow&&item.reorderQty>0&&canEdit&&<button onClick={()=>adjust(item.id,item.reorderQty)} style={{...btn,background:C.green+"22",color:C.greenL,padding:"3px 10px",fontSize:10,border:`1px solid ${C.green}44`,width:"100%",marginTop:6}}>
            + Restock {item.reorderQty} {item.unit}
          </button>}

          {canEdit&&<button onClick={()=>openForm(item)} style={{fontSize:10,color:C.muted,background:"none",border:"none",cursor:"pointer",padding:"4px 0 0",width:"100%",textAlign:"right"}}>Edit ›</button>}
        </div>;
      })}
    </div>

    {/* ── EXPORT MODAL ── */}
    {showExport&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowExport(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:420,maxWidth:"96vw",padding:24}} onClick={e=>e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.navy}}>Export Inventory</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Choose department, filter, and format</div>
          </div>
          <button onClick={()=>setShowExport(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>
        </div>

        {/* Department */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Department</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {["All","Chef","Steward","Engineer","Deck"].map(d=>{
              const icons={"All":"","Chef":"","Steward":"","Engineer":"","Deck":""};
              const counts = d==="All" ? inventory.length : inventory.filter(i=>(DEPT_MAP[d]||[]).includes(i.category)).length;
              return <button key={d} onClick={()=>setExportDept(d)}
                style={{...btn,background:exportDept===d?C.brass:C.navyLight,color:exportDept===d?C.bg:C.text,
                  border:`1px solid ${exportDept===d?C.brass:C.border}`,padding:"9px 12px",textAlign:"left",
                  display:"flex",alignItems:"center",gap:8,justifyContent:"space-between"}}>
                <span>{icons[d]} {d==="All"?"Full Inventory":d}</span>
                <span style={{fontSize:10,opacity:.7}}>{counts} items</span>
              </button>;
            })}
          </div>
          {exportDept!=="All"&&<div style={{marginTop:6,fontSize:10,color:C.muted,padding:"4px 8px",background:C.navyLight,borderRadius:5}}>
            Categories: {(DEPT_MAP[exportDept]||[]).join(", ")}
          </div>}
        </div>

        {/* Filter */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Items to Include</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[
              ["all",     "All Items",              `${getExportItems().length} items`],
              ["low",     "Low Stock Only",          `${getExportItems().filter(i=>i.minQty>0&&i.qty<i.minQty&&i.qty>0).length} items`, C.amber],
              ["critical","Critical / Out of Stock", `${getExportItems().filter(i=>i.qty===0).length} items`, C.signal],
              ["category","Specific Category",       ""],
            ].map(([id,label,count,col])=>(
              <button key={id} onClick={()=>setExportFilter(id)}
                style={{...btn,background:exportFilter===id?`${col||C.blue}22`:C.navyLight,
                  border:`1px solid ${exportFilter===id?(col||C.blue)+"66":C.border}`,
                  color:exportFilter===id?(col||C.white):C.text,
                  padding:"8px 12px",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${exportFilter===id?(col||C.blue):C.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {exportFilter===id&&<span style={{width:7,height:7,borderRadius:"50%",background:col||C.blue}}/>}
                  </span>
                  {label}
                </span>
                {count&&<span style={{fontSize:10,color:col||C.muted,fontWeight:600}}>{count}</span>}
              </button>
            ))}
          </div>
          {exportFilter==="category"&&<select value={exportCat} onChange={e=>setExportCat(e.target.value)}
            style={{...inp,width:"100%",marginTop:7,padding:"7px 10px",fontSize:12}}>
            <option value="All">All Categories</option>
            {INV_CATS.map(c=><option key={c}>{c}</option>)}
          </select>}
        </div>

        {/* Preview count */}
        <div style={{background:C.navyLight,borderRadius:7,padding:"8px 12px",marginBottom:16,fontSize:12,color:C.text,display:"flex",justifyContent:"space-between"}}>
          <span>Items in export:</span>
          <span style={{fontWeight:700,color:C.brass}}>{(()=>{
            let items = [...inventory];
            if(exportDept!=="All") { const cats=DEPT_MAP[exportDept]||[]; items=items.filter(i=>cats.includes(i.category)); }
            if(exportFilter==="low")      items=items.filter(i=>i.minQty>0&&i.qty<i.minQty&&i.qty>0);
            if(exportFilter==="critical") items=items.filter(i=>i.qty===0);
            if(exportFilter==="category"&&exportCat!=="All") items=items.filter(i=>i.category===exportCat);
            return items.length;
          })()} items</span>
        </div>

        {/* Format buttons */}
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Export Format</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            ["xlsx","Excel",  ".xlsx",C.greenL],
            ["csv","CSV",    ".csv", C.blue],
            ["pdf","PDF",    "Print",C.amber],
          ].map(([fmt,label,ext,col])=>(
            <button key={fmt} onClick={()=>doExport(fmt)} disabled={exporting}
              style={{...btn,background:`${col}18`,border:`1px solid ${col}55`,color:col,
                padding:"11px 8px",flexDirection:"column",display:"flex",alignItems:"center",gap:3,
                opacity:exporting?.5:1}}>
              <span style={{fontSize:16}}>{label.split(" ")[0]}</span>
              <span style={{fontSize:12,fontWeight:700}}>{label.split(" ")[1]}</span>
              <span style={{fontSize:9,color:C.muted}}>{ext}</span>
            </button>
          ))}
        </div>

        <div style={{marginTop:12,fontSize:10,color:C.muted,textAlign:"center"}}>
          PDF opens print dialog · Excel & CSV download directly · Shareable by email
        </div>
      </div>
    </div>}

    {/* ── EXCEL IMPORT MODAL ── */}
    {showImport&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:1000,padding:16,overflowY:"auto"}} onClick={()=>setShowImport(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:700,maxWidth:"96vw",padding:24,marginTop:24}} onClick={e=>e.stopPropagation()}>

        {/* Modal header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.navy}}>Import Inventory from Spreadsheet</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Upload an Excel (.xlsx) or CSV file — AI will extract and map all items</div>
          </div>
          <button onClick={()=>setShowImport(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>
        </div>

        {/* Step: Upload */}
        {importStep==="upload"&&<div>
          <div style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:"36px 24px",textAlign:"center",cursor:"pointer",background:C.navyLight}}
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.brass;}}
            onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;}}
            onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;const f=e.dataTransfer.files[0];if(f){const dt=new DataTransfer();dt.items.add(f);fileRef.current.files=dt.files;handleFileUpload({target:{files:[f]}}); }}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={BarChart2} s={40} c={C.muted}/></div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>
              {importing?"Processing with AI…":"Drop your spreadsheet here or click to browse"}
            </div>
            <div style={{fontSize:12,color:C.muted}}>Supports .xlsx, .xls, .csv · Any column layout</div>
            {importing&&<div style={{marginTop:14,fontSize:12,color:C.brass}}>Reading file and mapping with Claude AI…</div>}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleFileUpload}/>

          {importError&&<div style={{background:C.signal+"15",border:`1px solid ${C.signal}44`,borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:C.signal}}>
            {"⚠ "}{importError}
          </div>}

          <div style={{marginTop:16,background:C.navyLight,borderRadius:8,padding:"10px 14px",fontSize:11,color:C.muted,lineHeight:1.7}}>
            <div style={{fontWeight:700,color:C.text,marginBottom:4}}>Tip — your spreadsheet can have any layout:</div>
            <div>• Column names like "Item", "Product", "Description", "Name" → mapped to item name</div>
            <div>• "Qty", "Quantity", "Stock", "Count" → mapped to quantity</div>
            <div>• "Unit", "UOM", "Measure" → mapped to unit</div>
            <div>• "Location", "Store", "Area" → mapped to location</div>
            <div>• "Category", "Type", "Department" → mapped to category</div>
          </div>
        </div>}

        {/* Step: Review */}
        {importStep==="review"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:13,color:C.greenL,fontWeight:700}}>
              {"✓ "}{importRows.length}{" items extracted — set quantities and confirm"}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setImportRows(p=>p.map(r=>({...r,_selected:true})))}
                style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:11}}>Select All</button>
              <button onClick={()=>setImportRows(p=>p.map(r=>({...r,_selected:false})))}
                style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:11}}>Deselect All</button>
            </div>
          </div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"30px 1fr 120px 70px 90px 80px",gap:6,padding:"5px 8px",marginBottom:4}}>
            {["","Item Name","Category","Qty","Unit",""].map((h,i)=>(
              <div key={i} style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{h}</div>
            ))}
          </div>

          <div style={{maxHeight:"45vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {importRows.map((row,i)=>(
              <div key={row._id} style={{display:"grid",gridTemplateColumns:"30px 1fr 120px 70px 90px 80px",gap:6,alignItems:"center",
                background:row._selected?C.navyLight:C.navyMid,border:`1px solid ${row._selected?C.border:"transparent"}`,
                borderRadius:7,padding:"6px 8px",opacity:row._selected?1:0.45}}>
                {/* Checkbox */}
                <input type="checkbox" checked={row._selected} onChange={()=>setImportRows(p=>p.map((r,j)=>j===i?{...r,_selected:!r._selected}:r))} style={{cursor:"pointer"}}/>
                {/* Name */}
                <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={row.name}>{row.name}</div>
                {/* Category */}
                <select value={row.category} onChange={e=>setImportRows(p=>p.map((r,j)=>j===i?{...r,category:e.target.value}:r))}
                  style={{...inp,padding:"3px 6px",fontSize:11,width:"100%"}}>
                  {["Engineering","Spare Parts","Deck","Guest Supplies","Cleaning","Galley","Safety","Navigation","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
                {/* Qty */}
                <input type="number" min="0" value={row._qty}
                  onChange={e=>setImportRows(p=>p.map((r,j)=>j===i?{...r,_qty:Number(e.target.value)}:r))}
                  style={{...inp,padding:"3px 6px",fontSize:12,width:"100%",textAlign:"center"}}/>
                {/* Unit */}
                <select value={row.unit} onChange={e=>setImportRows(p=>p.map((r,j)=>j===i?{...r,unit:e.target.value}:r))}
                  style={{...inp,padding:"3px 6px",fontSize:11,width:"100%"}}>
                  {["Units","L","Kg","Cans","Boxes","Sets","Pairs","Cases","Rolls","Metres"].map(u=><option key={u}>{u}</option>)}
                </select>
                {/* Location */}
                <input value={row.location} onChange={e=>setImportRows(p=>p.map((r,j)=>j===i?{...r,location:e.target.value}:r))}
                  placeholder="Location" style={{...inp,padding:"3px 6px",fontSize:11,width:"100%"}}/>
              </div>
            ))}
          </div>

          {/* Confirm bar */}
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:14,paddingTop:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:C.muted,flex:1}}>
              {importRows.filter(r=>r._selected).length} of {importRows.length} items selected for import
            </div>
            <button onClick={()=>{setImportStep("upload");setImportRows([]);}}
              style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>← Back</button>
            <button onClick={confirmImport} disabled={!importRows.some(r=>r._selected)}
              style={{...btn,background:C.brass,color:C.bg,opacity:importRows.some(r=>r._selected)?1:0.5}}>
              {"✓ Add "}{importRows.filter(r=>r._selected).length}{" Items to Inventory"}
            </button>
          </div>
        </div>}

      </div>
    </div>}

    {/* Form modal */}
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowForm(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:500,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:16,color:C.navy,marginBottom:16}}>{editItem?"Edit Item":"Add Inventory Item"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <FF label="Item Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} req ph="e.g. Engine Oil 15W-40"/>
          <FF label="Category" type="select" value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} opts={INV_CATS} half/>
          <FF label="Unit" type="select" value={form.unit} onChange={v=>setForm(p=>({...p,unit:v}))} opts={["Units","L","Kg","Cans","Boxes","Sets","Pairs","Cases","Rolls","Metres"]} half/>
          <FF label="Current Quantity" type="number" value={form.qty} onChange={v=>setForm(p=>({...p,qty:Number(v)}))} half/>
          <FF label="Minimum Quantity" type="number" value={form.minQty} onChange={v=>setForm(p=>({...p,minQty:Number(v)}))} half/>
          <FF label="Reorder Quantity" type="number" value={form.reorderQty} onChange={v=>setForm(p=>({...p,reorderQty:Number(v)}))} half/>
          <FF label="Location" value={form.location} onChange={v=>setForm(p=>({...p,location:v}))} half ph="e.g. Engine Room"/>
          <FF label="Supplier" value={form.supplier} onChange={v=>setForm(p=>({...p,supplier:v}))} half ph="e.g. Marine Store Dubai"/>
          <FF label="Notes" type="textarea" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} rows={2}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={save} style={{...btn,background:C.brass,color:C.bg}}>Save</button>
          <button onClick={()=>setShowForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
          {editItem&&<button onClick={()=>del(editItem.id,editItem.name)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
        </div>
      </div>
    </div>}
    {["captain","management","engineer","stew","chef"].includes(role)&&<FloatingAI label="Provisioning" color={C.orange}><AIProvisioningModule inventory={inventory} guests={[]} tasks={[]} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4 — LOGBOOK MODULE
// ═══════════════════════════════════════════════════════════════

const INIT_LOGBOOK = [
  {id:"l1",date:d3(-2),departure:"Dubai Marina",arrival:"Abu Dhabi — Yas Marina",weather:"SE 12kts, 1.0m swell, visibility good",fuelStart:4200,fuelEnd:3800,portHours:2830,stbdHours:2845,crew:5,guests:0,incidents:"None",notes:"Smooth passage. Generator #1 showing slight increase in fuel consumption — engineer to monitor.",distance:120,captain:"Captain"},
  {id:"l2",date:d3(-1),departure:"Abu Dhabi — Yas Marina",arrival:"Dubai Marina",weather:"N 8kts, calm, visibility excellent",fuelStart:3800,fuelEnd:3500,portHours:2831,stbdHours:2847,crew:5,guests:0,incidents:"Bilge pump #2 triggered unexpectedly at 14:32. Investigated — no water ingress found. Pump reset. Engineer monitoring.",notes:"Bilge pump incident logged. Engineer to fit bilge alarm sensor. Crew refresher on MOB procedure conducted.",distance:120,captain:"Captain"},
  {id:"l3",date:d3(-5),departure:"Dubai Marina",arrival:"Sir Bu Nair Island",weather:"NE 15kts, 1.5m swell, occasional spray",fuelStart:4800,fuelEnd:4100,portHours:2815,stbdHours:2829,crew:5,guests:4,incidents:"None",notes:"Owner and family onboard. Overnight anchor at Sir Bu Nair. Excellent snorkelling. Chef prepared beach BBQ.",distance:180,captain:"Captain"},
];

function LogbookModule({logbook,setLogbook,role,logAudit,liveWeather}) {
  const logL = (action,detail) => logAudit&&logAudit(action,detail,"Logbook");
  const [showForm,setShowForm]   = useState(false);
  const [editEntry,setEditEntry] = useState(null);
  const [selected,setSelected]   = useState(null);
  const [search,setSearch]       = useState("");
  const [wxSnap,setWxSnap]       = useState(null); // weather snapshot attached to current form
  const [form,setForm]           = useState({date:TODAY,departure:"",arrival:"",weather:"",fuelStart:0,fuelEnd:0,portHours:0,stbdHours:0,crew:0,guests:0,incidents:"None",notes:"",distance:0,captain:"Captain"});
  const canEdit = ["captain","management"].includes(role);

  // Build a human-readable weather string from live weather snapshot
  function buildWeatherString(lw) {
    if(!lw?.data) return "";
    const cur  = lw.data.atmo?.current;
    const mcur = lw.data.marine?.current;
    if(!cur) return "";
    const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    const wKt  = cur.wind_speed_10m  != null ? Math.round(ms2kt(cur.wind_speed_10m))  : null;
    const wDeg = cur.wind_direction_10m != null ? dirs[Math.round(cur.wind_direction_10m/22.5)%16] : null;
    const gKt  = cur.wind_gusts_10m  != null ? Math.round(ms2kt(cur.wind_gusts_10m))  : null;
    const wvH  = mcur?.wave_height   != null ? mcur.wave_height.toFixed(1)  : null;
    const swH  = mcur?.swell_wave_height != null ? mcur.swell_wave_height.toFixed(1) : null;
    const vis  = cur.visibility      != null ? Math.round(cur.visibility/1000) : null;
    const sea  = wvH!=null ? getSeaState(parseFloat(wvH)) : null;
    let parts = [];
    if(wDeg&&wKt!=null) parts.push(`${wDeg} ${wKt}kt${gKt!=null?` G${gKt}`:""}` );
    if(wvH!=null)       parts.push(`${wvH}m waves`);
    if(swH!=null)       parts.push(`${swH}m swell`);
    if(sea)             parts.push(sea.label);
    if(vis!=null)       parts.push(vis>5?"visibility good":`visibility ${vis}km`);
    return parts.join(", ");
  }

  const visible = logbook.filter(e=>!search||
    e.departure.toLowerCase().includes(search.toLowerCase())||
    e.arrival.toLowerCase().includes(search.toLowerCase())||
    e.notes.toLowerCase().includes(search.toLowerCase())||
    e.incidents.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b)=>b.date.localeCompare(a.date));

  function openForm(entry){
    setEditEntry(entry||null);
    if(entry) {
      setForm({...entry});
      setWxSnap(null);
    } else {
      // Auto-fill from live weather for new entries
      const wxStr = buildWeatherString(liveWeather);
      const locName = liveWeather?.name || "";
      setWxSnap(liveWeather||null);
      setForm({
        date:TODAY,
        departure: locName,
        arrival:"",
        weather: wxStr,
        fuelStart:0, fuelEnd:0, portHours:0, stbdHours:0,
        crew:0, guests:0, incidents:"None", notes:"", distance:0, captain:"Captain"
      });
    }
    setShowForm(true);
  }

  function save(){
    if(!form.departure||!form.arrival) return;
    if(editEntry){
      setLogbook(p=>p.map(e=>e.id===editEntry.id?{...e,...form}:e));
      logL("Logbook Updated",`Entry ${form.date}: ${form.departure} to ${form.arrival} updated`);
    } else {
      const entry = {
        ...form,
        id:`l${Date.now()}`,
        wxSnapshot: wxSnap ? {
          name:    wxSnap.name,
          lat:     wxSnap.lat,
          lon:     wxSnap.lon,
          fetchedAt: wxSnap.fetchedAt,
          windKt:  wxSnap.data?.atmo?.current ? Math.round(ms2kt(wxSnap.data.atmo.current.wind_speed_10m)) : null,
          gustKt:  wxSnap.data?.atmo?.current ? Math.round(ms2kt(wxSnap.data.atmo.current.wind_gusts_10m)) : null,
          tempC:   wxSnap.data?.atmo?.current ? Math.round(wxSnap.data.atmo.current.temperature_2m) : null,
          waveH:   wxSnap.data?.marine?.current?.wave_height ?? null,
        } : null,
      };
      setLogbook(p=>[entry,...p]);
      logL("Logbook Entry",`${form.date}: ${form.departure} to ${form.arrival}${wxSnap?" (weather auto-attached)":""}`);
    }
    setShowForm(false);
  }

  function del(id,departure,arrival){
    setLogbook(p=>p.filter(e=>e.id!==id));
    setSelected(null);
    logL("Logbook Deleted",`Entry ${departure} to ${arrival} deleted`);
  }

  const totalDistance=logbook.reduce((s,e)=>s+(e.distance||0),0);
  const totalFuelUsed=logbook.reduce((s,e)=>s+((e.fuelStart||0)-(e.fuelEnd||0)),0);
  const totalPassages=logbook.length;

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap"}}>
      <div>


      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Captain's Logbook</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{totalPassages} entries · {totalDistance.toLocaleString()} nm total · {totalFuelUsed.toLocaleString()}L fuel used</div>
      </div>
      {canEdit&&<button onClick={()=>openForm(null)} style={{...btn,background:C.brass,color:C.bg}}>+ New Entry</button>}
    </div>

    {/* Search */}
    <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by departure, arrival, notes, incidents…"
        style={{...inp,width:300,padding:"6px 10px",fontSize:12}}/>
      {search&&<button onClick={()=>setSearch("")} style={{...btn,background:C.signal+"22",color:C.signal,padding:"5px 10px",fontSize:11,border:`1px solid ${C.signal}44`}}>✕</button>}
    </div>

    {/* Entries */}
    {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={BookOpen} s={28} c={C.muted}/></div>No logbook entries yet.</div>}
    {visible.map(entry=>{
      const fuelUsed=(entry.fuelStart||0)-(entry.fuelEnd||0);
      const hasIncident=entry.incidents&&entry.incidents!=="None";
      return <div key={entry.id} onClick={()=>setSelected(entry)} style={{background:C.card,border:`1px solid ${hasIncident?C.amber+"55":C.border}`,borderLeft:`3px solid ${hasIncident?C.amber:C.border}`,borderRadius:10,padding:16,marginBottom:10,cursor:"pointer",transition:"background .12s"}}
        onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
        onMouseLeave={e=>e.currentTarget.style.background=C.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.navy}}>{entry.departure} <span style={{color:C.muted,fontWeight:400}}>to</span> {entry.arrival}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{entry.date} · {entry.weather}</div>
          </div>
          {hasIncident&&<Pill label="Incident" bg={C.amber+"22"} color={C.amber} small dot/>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
          {[["Fuel Used",`${fuelUsed}L`],["Distance",`${entry.distance||"—"}nm`],["Port Eng",`${entry.portHours}hrs`],["Stbd Eng",`${entry.stbdHours}hrs`],["Crew/PAX",`${entry.crew}/${entry.guests}`]].map(([k,v])=>(
            <div key={k} style={{background:C.navyLight,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.5}}>{k}</div>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        {(entry.notes||hasIncident)&&<div style={{marginTop:8,fontSize:12,color:C.muted,lineHeight:1.5}}>
          {hasIncident&&<div style={{color:C.amber,marginBottom:3}}>⚠ {entry.incidents}</div>}
          {entry.notes&&<div>{entry.notes.length>120?entry.notes.slice(0,120)+"…":entry.notes}</div>}
        </div>}
      </div>;
    })}

    {/* Detail modal */}
    {selected&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:1000,padding:16,overflowY:"auto"}} onClick={()=>setSelected(null)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:580,maxWidth:"95vw",padding:24,marginTop:24}} onClick={e=>e.stopPropagation()}>
        <BackBtn onBack={()=>setSelected(null)} label="Back to Logbook"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:C.navy}}>{selected.departure} to {selected.arrival}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{selected.date} · Signed: {selected.captain}</div>
          </div>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>×</button>
        </div>
        <div style={{background:C.navyLight,borderRadius:7,padding:"10px 12px",marginBottom:12,fontSize:12,color:C.text}}>
          <div>{selected.weather}</div>
          {selected.wxSnapshot&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>
            {selected.wxSnapshot.name}
            {selected.wxSnapshot.lat!=null&&` · ${selected.wxSnapshot.lat.toFixed(4)}°, ${selected.wxSnapshot.lon.toFixed(4)}°`}
            {selected.wxSnapshot.fetchedAt&&` · ${new Date(selected.wxSnapshot.fetchedAt).toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})}`}
          </div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
          {[["Fuel Start",`${selected.fuelStart}L`],["Fuel End",`${selected.fuelEnd}L`],["Fuel Used",`${(selected.fuelStart||0)-(selected.fuelEnd||0)}L`],["Port Engine",`${selected.portHours}hrs`],["Stbd Engine",`${selected.stbdHours}hrs`],["Distance",`${selected.distance||"—"}nm`],["Crew Onboard",`${selected.crew}`],["Guests/PAX",`${selected.guests}`]].map(([k,v])=>(
            <div key={k} style={{background:C.navyLight,borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2}}>{k}</div>
              <div style={{fontSize:12,color:C.text,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {selected.incidents&&selected.incidents!=="None"&&<div style={{background:C.amber+"15",border:`1px solid ${C.amber}44`,borderRadius:7,padding:"9px 12px",marginBottom:12}}>
          <div style={{fontSize:10,color:C.amber,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>Incidents</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{selected.incidents}</div>
        </div>}
        {selected.notes&&<div style={{background:C.navyLight,borderRadius:7,padding:"9px 12px",marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>Notes</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{selected.notes}</div>
        </div>}
        <div style={{display:"flex",gap:8}}>
          {canEdit&&<button onClick={()=>{openForm(selected);setSelected(null);}} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`}}>Edit</button>}
          {canEdit&&<button onClick={()=>del(selected.id,selected.departure,selected.arrival)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
        </div>
      </div>
    </div>}

    {/* Entry form */}
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowForm(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:580,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:16,color:C.navy,marginBottom:14}}>{editEntry?"Edit Logbook Entry":"New Logbook Entry"}</div>

        {/* Weather snapshot banner — new entries only */}
        {!editEntry&&<div style={{background:wxSnap?`${C.greenL}12`:`${C.amber}12`,border:`1px solid ${wxSnap?C.greenL+"33":C.amber+"33"}`,borderRadius:8,padding:"9px 12px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:wxSnap?5:0}}>
            <Ico i={wxSnap?Sun:AlertTriangle} s={13} c={wxSnap?C.amber:C.signal}/>
            <span style={{fontSize:11,fontWeight:700,color:wxSnap?C.greenL:C.amber}}>
              {wxSnap?"Weather auto-attached from live data":"No live weather — open Weather tab first"}
            </span>
          </div>
          {wxSnap&&<>
            <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{form.weather||"—"}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>
              {wxSnap.name}
              {wxSnap.lat!=null&&` · ${wxSnap.lat.toFixed(4)}°, ${wxSnap.lon.toFixed(4)}°`}
              {wxSnap.fetchedAt&&` · ${new Date(wxSnap.fetchedAt).toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})}`}
            </div>
          </>}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <FF label="Date" type="date" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} half/>
          <FF label="Distance (nm)" type="number" value={form.distance} onChange={v=>setForm(p=>({...p,distance:Number(v)}))} half/>
          <FF label="Departure" value={form.departure} onChange={v=>setForm(p=>({...p,departure:v}))} half ph="e.g. Dubai Marina"/>
          <FF label="Arrival" value={form.arrival} onChange={v=>setForm(p=>({...p,arrival:v}))} half ph="e.g. Abu Dhabi"/>
          <FF label="Weather" value={form.weather} onChange={v=>setForm(p=>({...p,weather:v}))} ph="e.g. NE 15kts, 1.5m swell"/>
          <FF label="Fuel Start (L)" type="number" value={form.fuelStart} onChange={v=>setForm(p=>({...p,fuelStart:Number(v)}))} half/>
          <FF label="Fuel End (L)" type="number" value={form.fuelEnd} onChange={v=>setForm(p=>({...p,fuelEnd:Number(v)}))} half/>
          <FF label="Port Engine (hrs)" type="number" value={form.portHours} onChange={v=>setForm(p=>({...p,portHours:Number(v)}))} half/>
          <FF label="Stbd Engine (hrs)" type="number" value={form.stbdHours} onChange={v=>setForm(p=>({...p,stbdHours:Number(v)}))} half/>
          <FF label="Crew Onboard" type="number" value={form.crew} onChange={v=>setForm(p=>({...p,crew:Number(v)}))} half/>
          <FF label="Guests / PAX" type="number" value={form.guests} onChange={v=>setForm(p=>({...p,guests:Number(v)}))} half/>
          <FF label="Incidents" value={form.incidents} onChange={v=>setForm(p=>({...p,incidents:v}))} ph="None"/>
          <FF label="Notes" type="textarea" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} rows={3}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={save} style={{...btn,background:C.brass,color:C.bg}}>Save Entry</button>
          <button onClick={()=>setShowForm(false)} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
          {editEntry&&<button onClick={()=>del(editEntry.id,editEntry.departure,editEntry.arrival)} style={{...btn,background:C.signal+"22",color:C.signal,marginLeft:"auto"}}>Delete</button>}
        </div>
      </div>
    </div>}
    {["captain","management"].includes(role)&&<FloatingAI label="Incident Report" color={C.signal}><AIIncidentReportModule crew={[]} logbook={logbook} role={role} logAudit={logAudit}/></FloatingAI>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// DRIVE INTEGRATION + AI DOCUMENT SCANNER MODULE
// ═══════════════════════════════════════════════════════════════

// Document type detection patterns
const DOC_PATTERNS = [
  {pattern:/passport/i,                      type:"Passport",           category:"Crew"},
  {pattern:/seaman.?s?\s*book/i,             type:"Seaman's Book",      category:"Crew"},
  {pattern:/stcw/i,                          type:"STCW Certificate",   category:"Crew"},
  {pattern:/eng1|medical\s*cert/i,           type:"ENG1 Medical",       category:"Crew"},
  {pattern:/master\s*(cert|coc|of\s*comp)/i, type:"Master CoC",         category:"Crew"},
  {pattern:/chief\s*eng/i,                   type:"Chief Engineer CoC", category:"Crew"},
  {pattern:/food\s*safety/i,                 type:"Food Safety Cert",   category:"Crew"},
  {pattern:/radio\s*station/i,               type:"Ship Radio Licence", category:"Vessel"},
  {pattern:/insurance|hull|p.?i/i,           type:"Hull & P&I Insurance",category:"Vessel"},
  {pattern:/registration|vessel\s*reg/i,     type:"Vessel Registration", category:"Vessel"},
  {pattern:/ism|safety\s*mgmt/i,             type:"ISM Certificate",    category:"Compliance"},
  {pattern:/epirb/i,                         type:"EPIRB Registration", category:"Safety"},
  {pattern:/life\s*raft/i,                   type:"Life Raft Certificate",category:"Safety"},
  {pattern:/marpol|anti.?poll/i,             type:"MARPOL Certificate", category:"Compliance"},
  {pattern:/charter\s*lic/i,                 type:"Charter Licence",    category:"Commercial"},
  {pattern:/fire\s*supp/i,                   type:"Fire Suppression Cert",category:"Safety"},
  {pattern:/flag\s*state/i,                  type:"Flag State Certificate",category:"Compliance"},
  {pattern:/mlc/i,                           type:"MLC Certificate",    category:"Compliance"},
  {pattern:/crew\s*contract/i,               type:"Crew Contract",      category:"HR"},
];

// Date extraction patterns
const DATE_PATTERNS = [
  /expir[yed]*\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  /valid\s*until\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  /expires?\s*on\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  /date\s*of\s*expiry\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  /renewal\s*date\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/,
];

function parseDate(str) {
  // Normalise separators
  const norm = str.replace(/[\.\-]/g,"/");
  const parts = norm.split("/");
  if(parts.length!==3) return null;
  let [a,b,c] = parts.map(Number);
  // Handle 2-digit year
  if(c<100) c+=2000;
  // Assume DD/MM/YYYY
  const dt = new Date(c,b-1,a);
  if(isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
}

function extractDateFromText(text) {
  for(const pat of DATE_PATTERNS) {
    const m = text.match(pat);
    if(m) {
      const parsed = parseDate(m[1]||m[0]);
      if(parsed) return parsed;
    }
  }
  return null;
}

function detectDocType(filename, content="") {
  const combined = (filename + " " + content).toLowerCase();
  for(const {pattern,type,category} of DOC_PATTERNS) {
    if(pattern.test(combined)) return {type,category};
  }
  return {type:"Other Document", category:"Vessel"};
}

function docExpiryStatusFromDate(expiry) {
  if(!expiry) return "Unknown";
  const days=Math.ceil((new Date(expiry)-new Date())/86400000);
  if(days<0)   return "Expired";
  if(days<=90) return "Expiring Soon";
  return "Valid";
}

// AI Document Analysis using Claude API
async function analyseDocumentWithAI(filename, fileContent, isBase64=false) {
  try {
    const prompt = `You are a yacht document analyst. Analyse this document and extract:
1. Document type (e.g. Passport, Insurance, STCW Certificate, Vessel Registration, etc.)
2. Document holder name (if a crew document)
3. Expiry date (in format DD/MM/YYYY if found)
4. Document number/reference (if visible)
5. Category: one of [Crew, Vessel, Compliance, Safety, Commercial, HR]

Filename: ${filename}

Respond ONLY with valid JSON in this exact format:
{
  "type": "document type",
  "holderName": "name or null",
  "expiry": "DD/MM/YYYY or null",
  "number": "reference number or null",
  "category": "category",
  "confidence": "high/medium/low",
  "notes": "any important observations"
}`;

    const messages = isBase64 && fileContent ? [
      {
        role:"user",
        content:[
          {type:"document", source:{type:"base64", media_type:"application/pdf", data:fileContent}},
          {type:"text", text:prompt}
        ]
      }
    ] : [
      {role:"user", content:`${prompt}\n\nFile content preview: ${fileContent?.slice(0,500)||"(no content)"}`}
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6", max_tokens:500, messages})
    });
    const data = await res.json();
    const text = data.content?.[0]?.text||"{}";
    const clean = text.replace(/\`\`\`json|\`\`\`/g,"").trim();
    return JSON.parse(clean);
  } catch(e) {
    return null;
  }
}

function DriveModule({docs,setDocs,crew,setCrew,logAudit,role}) {
  const logD = (action,detail)=>logAudit&&logAudit(action,detail,"Drive Sync");

  const [driveType,setDriveType]       = useState(null); // null | "google" | "onedrive"
  const [connected,setConnected]       = useState(false);
  const [scanning,setScanning]         = useState(false);
  const [scanResults,setScanResults]   = useState([]);
  const [scanProgress,setScanProgress] = useState(0);
  const [scanStatus,setScanStatus]     = useState("");
  const [selected,setSelected]         = useState([]);
  const [importing,setImporting]       = useState(false);
  const [imported,setImported]         = useState([]);
  const [tab,setTab]                   = useState("connect"); // connect|scan|alerts
  const fileRef = useRef(null);

  // Expiry alerts from existing docs + crew docs
  const allExpiring = [
    ...docs.filter(d=>["Expired","Expiring Soon"].includes(d.status)).map(d=>({
      source:"vault", name:d.name, category:d.category,
      expiry:d.expiry, status:d.status,
      days:d.expiry?Math.ceil((new Date(d.expiry)-new Date())/86400000):null
    })),
    ...crew.flatMap(c=>c.docs
      .filter(d=>["Expired","Expiring Soon"].includes(d.status))
      .map(d=>({
        source:"crew", name:`${c.name} — ${d.type}`, category:"Crew",
        expiry:d.expiry, status:d.status,
        days:d.expiry?Math.ceil((new Date(d.expiry)-new Date())/86400000):null
      }))
    )
  ].sort((a,b)=>(a.days||999)-(b.days||999));

  // Simulate connecting to Drive
  async function connectDrive(type) {
    setDriveType(type);
    setScanStatus(`Connecting to ${type==="google"?"Google Drive":"OneDrive"}…`);
    await new Promise(r=>setTimeout(r,1200));
    setConnected(true);
    setScanStatus(`Connected to ${type==="google"?"Google Drive":"OneDrive"}`);
    setTab("scan");
    logD("Drive Connected",`${type==="google"?"Google Drive":"OneDrive"} connected by ${role}`);
  }

  // Upload local files and scan them
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if(!files.length) return;
    setScanning(true);
    setScanResults([]);
    setScanProgress(0);
    setTab("scan");

    const results = [];
    for(let i=0;i<files.length;i++) {
      const file = files[i];
      setScanStatus(`Analysing: ${file.name} (${i+1}/${files.length})…`);
      setScanProgress(Math.round(((i+0.5)/files.length)*100));

      // Read file
      let base64 = null;
      let textContent = "";
      try {
        base64 = await new Promise((res,rej)=>{
          const r=new FileReader();
          r.onload=ev=>res(ev.target.result.split(",")[1]);
          r.onerror=rej;
          r.readAsDataURL(file);
        });
      } catch(e) {}

      // First try pattern matching on filename
      const {type:detectedType, category:detectedCat} = detectDocType(file.name);

      // Then use AI for deeper analysis
      let aiResult = null;
      try {
        const isPDF = file.type==="application/pdf";
        aiResult = await analyseDocumentWithAI(file.name, base64, isPDF);
      } catch(e) {}

      const finalType     = aiResult?.type     || detectedType;
      const finalCategory = aiResult?.category || detectedCat;
      const rawExpiry     = aiResult?.expiry;
      let finalExpiry     = null;
      if(rawExpiry) {
        // Parse the AI-returned date
        finalExpiry = parseDate(rawExpiry) || extractDateFromText(rawExpiry);
      }

      const status = docExpiryStatusFromDate(finalExpiry);
      const days   = finalExpiry ? Math.ceil((new Date(finalExpiry)-new Date())/86400000) : null;

      results.push({
        id: `scan_${Date.now()}_${i}`,
        filename: file.name,
        fileSize: `${(file.size/1024).toFixed(0)} KB`,
        type: finalType,
        category: finalCategory,
        holderName: aiResult?.holderName||null,
        expiry: finalExpiry,
        number: aiResult?.number||null,
        status,
        days,
        confidence: aiResult?.confidence||"medium",
        notes: aiResult?.notes||"",
        selected: true,
        base64,
      });

      setScanProgress(Math.round(((i+1)/files.length)*100));

      // Small delay so UI updates visibly
      await new Promise(r=>setTimeout(r,300));
    }

    setScanResults(results);
    setSelected(results.map(r=>r.id));
    setScanning(false);
    setScanStatus(`Scan complete — ${results.length} document${results.length!==1?"s":""} analysed`);
    logD("Drive Scan",`${results.length} files scanned and analysed by AI`);
  }

  // Import selected results into vault
  function importSelected() {
    setImporting(true);
    const toImport = scanResults.filter(r=>selected.includes(r.id));
    const newDocs  = [];
    const importedNames = [];

    toImport.forEach(r=>{
      if(r.category==="Crew"&&r.holderName) {
        // Try to match to crew member
        const match = crew.find(c=>c.name.toLowerCase().includes(r.holderName.toLowerCase())||
          (r.holderName&&r.holderName.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));
        if(match) {
          const newDoc = {
            id:`cd${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            type:r.type, number:r.number||"", issued:"",
            expiry:r.expiry||"", status:r.status||"Valid", file:null,
          };
          setCrew(p=>p.map(c=>c.id===match.id?{...c,docs:[...c.docs.filter(d=>d.type!==r.type),newDoc]}:c));
          importedNames.push(`${match.name} — ${r.type}`);
          return;
        }
      }
      // Default: add to document vault
      const newDoc = {
        id:`d${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        name:r.type||r.filename,
        category:r.category,
        expiry:r.expiry||"",
        status:r.status||"Valid",
        uploadedDate:TODAY,
        size:r.fileSize,
        type:"PDF",
        notes:r.notes||(r.number?`Ref: ${r.number}`:""),
      };
      newDocs.push(newDoc);
      importedNames.push(r.type||r.filename);
    });

    if(newDocs.length) setDocs(p=>[...p,...newDocs]);
    setImported(importedNames);
    setImporting(false);
    logD("Documents Imported",`${toImport.length} documents imported: ${importedNames.slice(0,3).join(", ")}${importedNames.length>3?` +${importedNames.length-3} more`:""}`);

    // Auto-log expiry alerts
    toImport.filter(r=>["Expired","Expiring Soon"].includes(r.status)).forEach(r=>{
      logD("Expiry Alert Detected",`${r.type}: ${r.status} — expires ${r.expiry||"unknown"} (${r.days!==null?Math.abs(r.days)+"d":"?"}${r.days<0?" overdue":" remaining"})`);
    });

    setScanResults([]);
    setSelected([]);
    setTab("alerts");
  }

  const daysColor = (days) => {
    if(days===null) return C.muted;
    if(days<0)   return C.signal;
    if(days<=30) return C.signal;
    if(days<=90) return C.amber;
    return C.greenL;
  };

  const confidenceColor = {high:C.greenL, medium:C.amber, low:C.muted};

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:10,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.navy}}>Drive Sync & AI Scanner</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>
          Connect cloud storage · AI scans documents · Auto-detects expiry dates
        </div>
      </div>
      {connected&&<div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:C.greenL}}/>
        <span style={{fontSize:11,color:C.greenL}}>{driveType==="google"?"Google Drive":"OneDrive"} connected</span>
      </div>}
    </div>

    {/* Tab bar */}
    <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:16,width:"fit-content"}}>
      {[["connect","Connect",""],["scan","Scan Files",""],["alerts","Expiry Alerts",""]].map(([id,label,icon])=>(
        <button key={id} onClick={()=>setTab(id)} style={{...btn,background:tab===id?C.card:"transparent",color:tab===id?C.navy:C.muted,padding:"6px 14px",fontSize:12,border:"none",display:"flex",alignItems:"center",gap:5}}>
          <span>{icon}</span>{label}
          {id==="alerts"&&allExpiring.length>0&&<span style={{background:C.signal,color:"white",borderRadius:10,fontSize:9,padding:"1px 5px",fontWeight:700}}>{allExpiring.length}</span>}
        </button>
      ))}
    </div>

    {/* ── CONNECT TAB ─────────────────────────────────────────── */}
    {tab==="connect"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20,maxWidth:560}}>
        {/* Google Drive */}
        <div style={{background:C.card,border:`1px solid ${driveType==="google"&&connected?C.greenL+"66":C.border}`,borderRadius:12,padding:20,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={FolderOpen} s={36} c={C.muted}/></div>
          <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:4}}>Google Drive</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.5}}>Scan documents from your Google Drive folders</div>
          {driveType==="google"&&connected
            ?<div style={{fontSize:12,color:C.greenL,fontWeight:600}}>✓ Connected</div>
            :<button onClick={()=>connectDrive("google")} style={{...btn,background:C.brass,color:C.bg,width:"100%"}}>Connect</button>}
        </div>
        {/* OneDrive */}
        <div style={{background:C.card,border:`1px solid ${driveType==="onedrive"&&connected?C.greenL+"66":C.border}`,borderRadius:12,padding:20,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={Globe} s={36} c={C.muted}/></div>
          <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:4}}>OneDrive</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.5}}>Scan documents from your Microsoft OneDrive</div>
          {driveType==="onedrive"&&connected
            ?<div style={{fontSize:12,color:C.greenL,fontWeight:600}}>✓ Connected</div>
            :<button onClick={()=>connectDrive("onedrive")} style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,width:"100%"}}>Connect</button>}
        </div>
      </div>

      {/* Or upload directly */}
      <div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:12,padding:24,textAlign:"center",maxWidth:560}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={Upload} s={28} c={C.muted}/></div>
        <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:4}}>Upload Files Directly</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Upload PDFs and images — AI will scan and extract document details automatically</div>
        <button onClick={()=>fileRef.current.click()} style={{...btn,background:C.brass,color:C.bg}}>
          Choose Files to Scan
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileUpload} style={{display:"none"}}/>
        <div style={{fontSize:10,color:C.muted,marginTop:8}}>Supports PDF, JPG, PNG</div>
      </div>

      <div style={{marginTop:20,background:C.navyLight,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>How it works</div>
        {["Connect Google Drive or OneDrive, or upload files directly","AI scans each document and identifies the document type","Expiry dates are automatically extracted from the document","Review detected documents, confirm or edit details","Import selected documents into Bridge — crew docs auto-matched by name"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:7,alignItems:"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:C.brass+"33",border:`1px solid ${C.brass}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.brass,flexShrink:0}}>{i+1}</div>
            <span style={{fontSize:12,color:C.text,lineHeight:1.4}}>{s}</span>
          </div>
        ))}
      </div>
    </div>}

    {/* ── SCAN TAB ─────────────────────────────────────────────── */}
    {tab==="scan"&&<div>
      {scanning&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24,marginBottom:16,textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={Search} s={28} c={C.muted}/></div>
        <div style={{fontWeight:700,color:C.text,marginBottom:6}}>{scanStatus}</div>
        <div style={{background:C.navyLight,borderRadius:4,overflow:"hidden",height:6,maxWidth:300,margin:"0 auto 10px"}}>
          <div style={{width:`${scanProgress}%`,height:"100%",background:C.brass,transition:"width .3s"}}/>
        </div>
        <div style={{fontSize:11,color:C.muted}}>AI is reading and analysing each document…</div>
      </div>}

      {!scanning&&scanResults.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={FolderOpen} s={32} c={C.muted}/></div>
        <div style={{fontSize:14,color:C.white,marginBottom:6}}>No files scanned yet</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Upload files from the Connect tab to begin AI scanning</div>
        <button onClick={()=>setTab("connect")} style={{...btn,background:C.brass,color:C.bg}}>Go to Connect</button>
      </div>}

      {!scanning&&scanResults.length>0&&<>
        {/* Scan summary */}
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",flex:1,minWidth:100,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.navy,fontFamily:"monospace"}}>{scanResults.length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Scanned</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",flex:1,minWidth:100,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.signal,fontFamily:"monospace"}}>{scanResults.filter(r=>r.status==="Expired").length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Expired</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",flex:1,minWidth:100,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.amber,fontFamily:"monospace"}}>{scanResults.filter(r=>r.status==="Expiring Soon").length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Expiring</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",flex:1,minWidth:100,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.greenL,fontFamily:"monospace"}}>{scanResults.filter(r=>r.status==="Valid").length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Valid</div>
          </div>
        </div>

        {/* Select all + import */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" checked={selected.length===scanResults.length}
              onChange={()=>setSelected(selected.length===scanResults.length?[]:scanResults.map(r=>r.id))}
              style={{cursor:"pointer",width:16,height:16}}/>
            <span style={{fontSize:12,color:C.muted}}>{selected.length} of {scanResults.length} selected</span>
          </div>
          <button onClick={importSelected} disabled={selected.length===0||importing}
            style={{...btn,background:selected.length>0?C.brass:C.navyLight,color:selected.length>0?C.bg:C.muted,opacity:importing?.6:1}}>
            {importing?"Importing…":`Import ${selected.length} Document${selected.length!==1?"s":""}`}
          </button>
        </div>

        {/* Results list */}
        {scanResults.map(r=>{
          const dc=daysColor(r.days);
          const isSelected=selected.includes(r.id);
          return <div key={r.id} style={{background:isSelected?C.navyMid:C.card,border:`1px solid ${isSelected?C.brass:r.status==="Expired"?C.signal+"44":r.status==="Expiring Soon"?C.amber+"44":C.border}`,borderLeft:`3px solid ${r.status==="Expired"?C.signal:r.status==="Expiring Soon"?C.amber:C.greenL}`,borderRadius:9,padding:"12px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
            <input type="checkbox" checked={isSelected} onChange={()=>setSelected(p=>p.includes(r.id)?p.filter(x=>x!==r.id):[...p,r.id])} style={{cursor:"pointer",marginTop:2}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                <Pill label={r.category} bg={C.navyLight} color={C.muted} small/>
                <Pill label={`AI: ${r.confidence}`} bg={confidenceColor[r.confidence]+"22"} color={confidenceColor[r.confidence]} small/>
                {r.status!=="Unknown"&&<Pill label={r.status} bg={dc+"22"} color={dc} small dot/>}
              </div>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{r.type}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.filename} · {r.fileSize}</div>
              {r.holderName&&<div style={{fontSize:11,color:C.text,marginTop:2}}>{r.holderName}</div>}
              {r.number&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>Ref: {r.number}</div>}
              {r.notes&&<div style={{fontSize:11,color:C.muted,marginTop:2,fontStyle:"italic"}}>{r.notes}</div>}
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              {r.expiry
                ?<><div style={{fontSize:10,color:C.muted}}>Expires</div>
                  <div style={{fontSize:12,fontWeight:700,color:dc}}>{r.expiry}</div>
                  <div style={{fontSize:10,color:dc}}>{r.days!==null?(r.days<0?`${Math.abs(r.days)}d overdue`:`${r.days}d remaining`):"—"}</div></>
                :<div style={{fontSize:11,color:C.muted}}>No expiry found</div>}
            </div>
          </div>;
        })}

        {imported.length>0&&<div style={{background:C.green+"15",border:`1px solid ${C.green}44`,borderRadius:9,padding:"12px 14px",marginTop:10}}>
          <div style={{fontWeight:700,color:C.greenL,marginBottom:6}}>✓ {imported.length} document{imported.length!==1?"s":""} imported successfully</div>
          {imported.slice(0,5).map((n,i)=><div key={i} style={{fontSize:11,color:C.text}}>{n}</div>)}
          {imported.length>5&&<div style={{fontSize:11,color:C.muted}}>+{imported.length-5} more</div>}
        </div>}
      </>}
    </div>}

    {/* ── EXPIRY ALERTS TAB ────────────────────────────────────── */}
    {tab==="alerts"&&<div>
      <div style={{fontSize:13,color:C.muted,marginBottom:16}}>
        All expiring and expired documents across the vessel and crew — sorted by urgency.
      </div>
      {allExpiring.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={CheckCircle} s={32} c={C.greenL}/></div>
        <div style={{fontSize:14,color:C.greenL,fontWeight:600}}>All documents current</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4}}>No expiring or expired documents detected</div>
      </div>}
      {allExpiring.length>0&&<>
        {/* Summary */}
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{background:C.signal+"15",border:`1px solid ${C.signal}44`,borderRadius:8,padding:"10px 16px",flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.signal,fontFamily:"monospace"}}>{allExpiring.filter(d=>d.days!==null&&d.days<0).length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Expired</div>
          </div>
          <div style={{background:C.signal+"15",border:`1px solid ${C.signal}44`,borderRadius:8,padding:"10px 16px",flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.signal,fontFamily:"monospace"}}>{allExpiring.filter(d=>d.days!==null&&d.days>=0&&d.days<=30).length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Within 30 days</div>
          </div>
          <div style={{background:C.amber+"15",border:`1px solid ${C.amber}44`,borderRadius:8,padding:"10px 16px",flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.amber,fontFamily:"monospace"}}>{allExpiring.filter(d=>d.days!==null&&d.days>30&&d.days<=90).length}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>31–90 days</div>
          </div>
        </div>
        {allExpiring.map((d,i)=>{
          const dc=daysColor(d.days);
          return <div key={i} style={{background:C.card,border:`1px solid ${dc}33`,borderLeft:`3px solid ${dc}`,borderRadius:8,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,marginBottom:4,alignItems:"center"}}>
                <Pill label={d.source==="crew"?"Crew Document":"Vessel Document"} bg={C.navyLight} color={C.muted} small/>
                <Pill label={d.category} bg={C.navyLight} color={C.muted} small/>
              </div>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{d.name}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:10,color:C.muted}}>Expires</div>
              <div style={{fontSize:13,fontWeight:700,color:dc}}>{d.expiry||"Unknown"}</div>
              <div style={{fontSize:11,color:dc,marginTop:2}}>
                {d.days===null?"—":d.days<0?`${Math.abs(d.days)}d overdue`:`${d.days}d remaining`}
              </div>
            </div>
          </div>;
        })}
      </>}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #1 — READINESS CHECK
// ═══════════════════════════════════════════════════════════════
function AIReadinessModule({tasks, crew, docs, assets, inventory, logbook, role, logAudit}) {
  const [query,setQuery]       = useState("");
  const [loading,setLoading]   = useState(false);
  const [result,setResult]     = useState(null);
  const [history,setHistory]   = useState([]);
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Assistant");

  const QUICK = [
    "Are we ready for the owner's arrival tomorrow?",
    "What is the current yacht health status?",
    "Are all crew documents current?",
    "What critical tasks need to be done today?",
    "Is the vessel ready for a charter this weekend?",
    "Summarise all overdue items across the vessel",
  ];

  function buildContext() {
    const overdueTasks   = tasks.filter(t=>t.status==="Overdue");
    const criticalTasks  = tasks.filter(t=>t.priority==="Critical"&&t.status!=="Done");
    const pendingTasks   = tasks.filter(t=>t.status==="Pending");
    const doneTasks      = tasks.filter(t=>t.status==="Done");
    const expiredDocs    = docs.filter(d=>d.status==="Expired");
    const expiringDocs   = docs.filter(d=>d.status==="Expiring Soon");
    const crewDocAlerts  = crew.flatMap(c=>c.docs.filter(d=>["Expired","Expiring Soon"].includes(d.status)).map(d=>({crew:c.name,...d})));
    const overdueAssets  = (assets||[]).filter(a=>assetServiceStatus(a)==="Overdue");
    const dueSoonAssets  = (assets||[]).filter(a=>assetServiceStatus(a)==="Due Soon");
    const lowStock       = (inventory||[]).filter(i=>i.minQty>0&&i.qty<i.minQty);
    const outOfStock     = (inventory||[]).filter(i=>i.qty===0&&i.minQty>0);
    const crewOnboard    = crew.filter(c=>c.onboard);
    const lastLogEntry   = logbook&&logbook[0];

    return `You are the AI assistant for BRIDGE — a professional yacht management platform.

You have full access to the vessel's current operational data. Answer the captain's question based on the actual data below. Be direct, specific, and actionable. Use bullet points for lists. Flag anything critical in bold.

=== VESSEL STATUS SNAPSHOT ===

TASKS:
- Total tasks: ${tasks.length}
- Overdue: ${overdueTasks.length} — ${overdueTasks.slice(0,5).map(t=>`${t.title} (${t.dept})`).join(", ")}${overdueTasks.length>5?` +${overdueTasks.length-5} more`:""}
- Critical open: ${criticalTasks.length} — ${criticalTasks.map(t=>t.title).join(", ")||"none"}
- Pending: ${pendingTasks.length}
- Completed: ${doneTasks.length}
- Awaiting approval: ${tasks.filter(t=>t.status==="Awaiting Approval").length}

CREW (${crewOnboard.length}/${crew.length} onboard):
${crew.map(c=>`- ${c.name} (${c.position}): ${c.onboard?"ONBOARD":"ASHORE"}`).join("\n")}

CREW DOCUMENT ALERTS:
${crewDocAlerts.length>0?crewDocAlerts.map(d=>`- ${d.crew} — ${d.type}: ${d.status} (expires ${d.expiry||"unknown"})`).join("\n"):"All crew documents current"}

VESSEL DOCUMENTS:
- Expired: ${expiredDocs.length} — ${expiredDocs.map(d=>d.name).join(", ")||"none"}
- Expiring soon: ${expiringDocs.length} — ${expiringDocs.map(d=>`${d.name} (${d.expiry})`).join(", ")||"none"}

MAINTENANCE:
- Assets overdue for service: ${overdueAssets.length} — ${overdueAssets.map(a=>a.name).join(", ")||"none"}
- Assets due soon: ${dueSoonAssets.length} — ${dueSoonAssets.map(a=>`${a.name} (${hoursUntilService(a)}hrs remaining)`).join(", ")||"none"}
- Open job cards: ${([]||[]).length}

INVENTORY:
- Out of stock: ${outOfStock.length} — ${outOfStock.map(i=>i.name).join(", ")||"none"}
- Low stock: ${lowStock.filter(i=>i.qty>0).length} — ${lowStock.filter(i=>i.qty>0).map(i=>`${i.name} (${i.qty} ${i.unit} remaining)`).join(", ")||"none"}
- Guest supplies low: ${(inventory||[]).filter(i=>i.category==="Guest Supplies"&&i.qty<i.minQty).map(i=>i.name).join(", ")||"none"}

LAST LOGBOOK ENTRY:
${lastLogEntry?`- ${lastLogEntry.date}: ${lastLogEntry.departure} to ${lastLogEntry.arrival}. Weather: ${lastLogEntry.weather}. Incidents: ${lastLogEntry.incidents}`:"No recent logbook entries"}

=== END OF DATA ===

Captain's question: `;
  }

  async function askAI(q) {
    const question = q||query;
    if(!question.trim()) return;
    setLoading(true);
    setResult(null);
    logA("AI Readiness Query", question);

    try {
      const context = buildContext();
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          messages:[{role:"user", content: context + question}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "No response received.";
      const entry = {id:Date.now(), question, answer:text, timestamp:new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})};
      setResult(entry);
      setHistory(p=>[entry,...p].slice(0,10));
      logA("AI Response", `Query: "${question.slice(0,60)}…"`);
    } catch(e) {
      setResult({question, answer:"Connection error. Please try again.", timestamp:""});
    }
    setLoading(false);
    setQuery("");
  }

  function formatAnswer(text) {
    // Convert **bold** and bullet points to styled JSX
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:8}}/>;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const content = parts.map((p,j)=>j%2===1
        ? <strong key={j} style={{color:C.white,fontWeight:700}}>{p}</strong>
        : <span key={j}>{p}</span>
      );
      const isBullet = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      return <div key={i} style={{display:"flex",gap:isBullet?8:0,marginBottom:4,paddingLeft:isBullet?0:0}}>
        {isBullet&&<span style={{color:C.brass,flexShrink:0,marginTop:1}}>›</span>}
        <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{content}</span>
      </div>;
    });
  }

  return <div>
    <div style={{marginBottom:16}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Readiness Check</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Ask anything about the vessel — AI reads all live data to answer</div>
    </div>

    {/* Quick questions */}
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Quick Questions</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {QUICK.map((q,i)=>(
          <button key={i} onClick={()=>askAI(q)} disabled={loading}
            style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"6px 12px",fontSize:11,textAlign:"left",opacity:loading?.6:1}}>
            {q}
          </button>
        ))}
      </div>
    </div>

    {/* Input */}
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      <input value={query} onChange={e=>setQuery(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&!loading&&askAI()}
        placeholder="Ask about vessel readiness, crew, tasks, maintenance…"
        style={{...inp,flex:1,padding:"10px 14px",fontSize:13}}/>
      <button onClick={()=>askAI()} disabled={loading||!query.trim()}
        style={{...btn,background:query.trim()&&!loading?C.brass:C.navyLight,color:query.trim()&&!loading?C.bg:C.muted,padding:"10px 20px",flexShrink:0,transition:"all .15s"}}>
        {loading?"…":"Ask AI"}
      </button>
    </div>

    {/* Loading */}
    {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24,marginBottom:16,textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={Bot} s={24} c={C.brass}/></div>
      <div style={{fontSize:13,color:C.muted}}>AI is reading vessel data…</div>
      <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:12}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.brass,opacity:.4,animation:`pulse ${.6+i*.2}s ease-in-out infinite alternate`}}/>)}
      </div>
    </div>}

    {/* Result */}
    {result&&!loading&&<div style={{background:C.card,border:`1px solid ${C.brass}44`,borderRadius:12,padding:20,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:C.brass+"22",border:`2px solid ${C.brass}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.brass}}>AI BRIDGE ASSISTANT</div>
            <div style={{fontSize:10,color:C.muted}}>{result.timestamp}</div>
          </div>
        </div>
      </div>
      <div style={{background:C.navyLight,borderRadius:8,padding:"10px 12px",marginBottom:10,fontSize:12,color:C.muted,fontStyle:"italic"}}>
        "{result.question}"
      </div>
      <div style={{lineHeight:1.7}}>{formatAnswer(result.answer)}</div>
    </div>}

    {/* History */}
    {history.length>1&&<div>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Previous Questions</div>
      {history.slice(1).map(h=>(
        <div key={h.id} onClick={()=>setResult(h)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:6,cursor:"pointer",transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.brass+"66"}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{h.timestamp}</div>
          <div style={{fontSize:12,color:C.text}}>{h.question}</div>
        </div>
      ))}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #2 — MAINTENANCE ASSISTANT
// ═══════════════════════════════════════════════════════════════
function AIMaintenanceModule({assets, jobs, tasks, role, logAudit}) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [query, setQuery]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [history, setHistory]             = useState([]);
  const [manualBase64, setManualBase64]   = useState(null);
  const [manualName, setManualName]       = useState("");
  const manualRef                         = useRef(null);
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Maintenance");

  const QUICK_BY_CAT = {
    Propulsion: ["Engine running rough — what should I check?","Oil pressure warning light came on — diagnose","High coolant temperature — possible causes?","Engine hours tracker — when is service due?"],
    Electrical: ["Generator not producing full load — diagnose","Generator oil consumption higher than normal","Battery bank not holding charge — what to check?","Generator alarm triggered — what does it mean?"],
    Systems:    ["Watermaker output dropped — possible causes?","Watermaker high pressure alarm — diagnose","Watermaker membrane when should it be replaced?"],
    default:    ["What does the last service record show?","When is the next service due?","What parts are typically needed for service?","Any known issues with this equipment?"],
  };

  function getQuickQuestions(asset) {
    if(!asset) return [];
    return QUICK_BY_CAT[asset.category] || QUICK_BY_CAT.default;
  }

  function buildAssetContext(asset) {
    if(!asset) return "";
    const rem    = hoursUntilService(asset);
    const status = assetServiceStatus(asset);
    const assetJobs = jobs.filter(j=>j.assetId===asset.id);
    const assetTasks = tasks.filter(t=>t.title.toLowerCase().includes(asset.name.toLowerCase().split(" ")[0]));

    return `You are an expert marine engineer AI assistant for a professional superyacht.
You have full access to this vessel's maintenance records. Give specific, technical, actionable answers.
Use bullet points. If something is critical or urgent, say so clearly.
${manualBase64?`A PDF manual has been uploaded — use it to answer questions about this specific equipment.\n`:""}

=== ASSET PROFILE ===
Name: ${asset.name}
Category: ${asset.category}
Manufacturer: ${asset.manufacturer}
Model: ${asset.model}
Serial Number: ${asset.serial||"—"}
Installed: ${asset.installedDate||"—"}
Current Hours: ${asset.currentHours.toLocaleString()} hrs
Service Interval: Every ${asset.serviceIntervalHours} hrs
Last Service Hours: ${asset.lastServiceHours.toLocaleString()} hrs
Last Service Date: ${asset.lastServiceDate||"—"}
Hours Until Next Service: ${rem!==null?(rem<=0?`OVERDUE by ${Math.abs(rem)} hrs`:rem+" hrs remaining"):"N/A (calendar-based)"}
Current Status: ${status}
Notes: ${asset.notes||"None"}

=== SERVICE HISTORY (${asset.history?.length||0} records) ===
${asset.history&&asset.history.length>0
  ? asset.history.slice(0,6).map(h=>`[${h.date}] ${h.type}: ${h.desc} | Technician: ${h.technician} | Hours worked: ${h.hours} | Parts: ${h.parts||"none"}`).join("\n")
  : "No service history recorded"}

=== OPEN JOB CARDS (${assetJobs.length}) ===
${assetJobs.length>0
  ? assetJobs.map(j=>`[${j.id}] ${j.title} — Status: ${j.status} | Priority: ${j.priority} | Notes: ${j.notes||"none"}`).join("\n")
  : "No open job cards"}

=== END ASSET DATA ===

Engineer's question: `;
  }

  async function askAI(q) {
    const question = q || query;
    if(!question.trim()||!selectedAsset) return;
    setLoading(true);
    setResult(null);
    logA("Maintenance Query", `${selectedAsset.name}: ${question}`);

    try {
      const context = buildAssetContext(selectedAsset);
      const messages = manualBase64 ? [
        {role:"user", content:[
          {type:"document", source:{type:"base64", media_type:"application/pdf", data:manualBase64}},
          {type:"text", text: context + question}
        ]}
      ] : [
        {role:"user", content: context + question}
      ];

      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6", max_tokens:1000, messages})
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "No response received.";
      const entry = {id:Date.now(), asset:selectedAsset.name, question, answer:text, timestamp:new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})};
      setResult(entry);
      setHistory(p=>[entry,...p].slice(0,10));
      logA("AI Response", `${selectedAsset.name} — "${question.slice(0,50)}"`);
    } catch(e) {
      setResult({question, answer:"Connection error. Please try again.", timestamp:""});
    }
    setLoading(false);
    setQuery("");
  }

  function uploadManual(e) {
    const file = e.target.files[0];
    if(!file) return;
    setManualName(file.name);
    const r = new FileReader();
    r.onload = ev => setManualBase64(ev.target.result.split(",")[1]);
    r.readAsDataURL(file);
    logA("Manual Uploaded", `${file.name} uploaded for ${selectedAsset?.name||"unknown asset"}`);
  }

  function formatAnswer(text) {
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:6}}/>;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const content = parts.map((p,j)=>j%2===1
        ?<strong key={j} style={{color:C.white,fontWeight:700}}>{p}</strong>
        :<span key={j}>{p}</span>);
      const isBullet = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      const isNum    = /^\d+\./.test(line.trimStart());
      return <div key={i} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}>
        {isBullet&&<span style={{color:C.blue,flexShrink:0,marginTop:2}}>›</span>}
        {isNum&&<span style={{color:C.blue,flexShrink:0,marginTop:2,fontWeight:700,fontSize:12}}>{line.match(/^\d+/)?.[0]}.</span>}
        <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{isBullet?content:isNum?<span>{content}</span>:content}</span>
      </div>;
    });
  }

  const overdueAssets = assets.filter(a=>assetServiceStatus(a)==="Overdue");
  const dueSoonAssets = assets.filter(a=>assetServiceStatus(a)==="Due Soon");

  return <div>
    <div style={{marginBottom:16}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Maintenance Assistant</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Select an asset — AI reads its full history and diagnoses issues</div>
    </div>

    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      {/* LEFT — asset selector */}
      <div style={{width:220,flexShrink:0}}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Select Asset</div>

        {overdueAssets.length>0&&<div style={{background:C.signal+"12",border:`1px solid ${C.signal}33`,borderRadius:7,padding:"7px 10px",marginBottom:8,fontSize:11,color:C.signal,fontWeight:600}}>
          {"⚠ "}{overdueAssets.length}{" asset"}{overdueAssets.length>1?"s":""}{" overdue"}
        </div>}

        {["Propulsion","Electrical","Systems","HVAC","Tender","Water Toys","Navigation","Hydraulics","Safety"].map(cat=>{
          const catAssets = assets.filter(a=>a.category===cat);
          if(!catAssets.length) return null;
          return <div key={cat} style={{marginBottom:10}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4,paddingLeft:4}}>{cat}</div>
            {catAssets.map(a=>{
              const st  = assetServiceStatus(a);
              const sc  = assetStatusColor(st);
              const sel = selectedAsset?.id===a.id;
              return <button key={a.id} onClick={()=>{setSelectedAsset(a);setResult(null);setQuery("");}}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",background:sel?C.navyLight:"transparent",border:`1px solid ${sel?C.blue+"88":C.border}`,borderRadius:7,cursor:"pointer",marginBottom:4,textAlign:"left"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:sc,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:sel?C.white:C.text,fontWeight:sel?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div>
                  <div style={{fontSize:9,color:C.muted}}>{a.currentHours.toLocaleString()}hrs</div>
                </div>
              </button>;
            })}
          </div>;
        })}
      </div>

      {/* RIGHT — chat panel */}
      <div style={{flex:1,minWidth:0}}>
        {!selectedAsset&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:"center",color:C.muted}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={Wrench} s={32} c={C.muted}/></div>
          <div style={{fontSize:14,color:C.text,fontWeight:600,marginBottom:4}}>Select an asset to begin</div>
          <div style={{fontSize:12}}>Choose any equipment from the list to ask the AI about it</div>
        </div>}

        {selectedAsset&&<>
          {/* Asset header */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontWeight:700,color:C.text,fontSize:15}}>{selectedAsset.name}</div>
                <div style={{fontSize:11,color:C.muted}}>{selectedAsset.manufacturer} {selectedAsset.model}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                {(()=>{const st=assetServiceStatus(selectedAsset);const sc=assetStatusColor(st);return <Pill label={st} bg={sc+"22"} color={sc} small dot/>;})()}
                {selectedAsset.serviceIntervalHours>0&&<Pill label={`${hoursUntilService(selectedAsset)<=0?"":"Next svc: "+hoursUntilService(selectedAsset)+"hrs"}`} bg={C.navyLight} color={C.muted} small/>}
              </div>
            </div>
            {selectedAsset.notes&&<div style={{fontSize:11,color:C.amber,marginTop:6,display:"flex",alignItems:"center",gap:5}}><Ico i={AlertTriangle} s={11} c={C.amber}/>{selectedAsset.notes}</div>}

            {/* Manual upload */}
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>manualRef.current.click()} style={{...btn,background:C.navyLight,color:C.muted,border:`1px dashed ${C.border}`,padding:"4px 12px",fontSize:11}}>
                {manualBase64?"Change Manual":"Upload Manual (PDF)"}
              </button>
              <input ref={manualRef} type="file" accept=".pdf" onChange={uploadManual} style={{display:"none"}}/>
              {manualBase64&&<span style={{fontSize:11,color:C.greenL}}>✓ {manualName} loaded</span>}
            </div>
          </div>

          {/* Quick questions */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Quick Diagnose</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {getQuickQuestions(selectedAsset).map((q,i)=>(
                <button key={i} onClick={()=>askAI(q)} disabled={loading}
                  style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 10px",fontSize:11,opacity:loading?.6:1}}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!loading&&askAI()}
              placeholder={`Describe the issue with ${selectedAsset.name}…`}
              style={{...inp,flex:1,padding:"10px 14px",fontSize:13}}/>
            <button onClick={()=>askAI()} disabled={loading||!query.trim()}
              style={{...btn,background:query.trim()&&!loading?C.blue:C.navyLight,color:query.trim()&&!loading?"white":C.muted,padding:"10px 20px",flexShrink:0,transition:"all .15s"}}>
              {loading?"…":"Diagnose"}
            </button>
          </div>

          {/* Loading */}
          {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14,textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Ico i={Wrench} s={22} c={C.muted}/></div>
            <div style={{fontSize:13,color:C.muted}}>AI is reading service history{manualBase64?" and manual":""}…</div>
          </div>}

          {/* Result */}
          {result&&!loading&&<div style={{background:C.card,border:`1px solid ${C.blue}44`,borderRadius:12,padding:18,marginBottom:14}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.blue+"22",border:`2px solid ${C.blue}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🤖</div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.blue}}>AI MAINTENANCE ASSISTANT</div>
                <div style={{fontSize:10,color:C.muted}}>{selectedAsset.name} · {result.timestamp}</div>
              </div>
            </div>
            <div style={{background:C.navyLight,borderRadius:7,padding:"8px 10px",marginBottom:10,fontSize:11,color:C.muted,fontStyle:"italic"}}>"{result.question}"</div>
            <div>{formatAnswer(result.answer)}</div>
          </div>}

          {/* History for this asset */}
          {history.filter(h=>h.asset===selectedAsset.name).slice(1).length>0&&<div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Previous Questions</div>
            {history.filter(h=>h.asset===selectedAsset.name).slice(1).map(h=>(
              <div key={h.id} onClick={()=>setResult(h)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",marginBottom:5,cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{fontSize:10,color:C.muted}}>{h.timestamp}</div>
                <div style={{fontSize:12,color:C.text,marginTop:1}}>{h.question}</div>
              </div>
            ))}
          </div>}
        </>}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #3 — PROVISIONING ASSISTANT
// ═══════════════════════════════════════════════════════════════
// ── PROVISIONING DEPARTMENT STRUCTURE ────────────────────────
const PROV_DEPTS = {
  Chef: {
    icon:"👨‍🍳", IconC:ChefHat, color:"#e07b39",
    categories:["Food","Beverages","Alcohol","Fresh Produce","Frozen Goods","Dry Stores"],
  },
  Steward: {
    icon:"🫧", IconC:Waves, color:"#3b9fd4",
    categories:["Cleaning Products","Guest Consumables","Laundry Supplies","Cabin Amenities","Interior Supplies"],
  },
  Engineer: {
    icon:"⚙️", IconC:Wrench, color:"#6b8cba",
    categories:["Spare Parts","Filters","Oils & Lubricants","Electrical Components","Hydraulic Components","Tools"],
  },
  Deck: {
    icon:"⚓", IconC:Anchor, color:"#25b085",
    categories:["Deck Consumables","Mooring Equipment","Safety Equipment","Water Toys","Exterior Cleaning Supplies"],
  },
};

// Infer department from category
function deptFromCat(cat) {
  return Object.entries(PROV_DEPTS).find(([,d])=>d.categories.includes(cat))?.[0]||"Chef";
}

// Role → default department
function defaultDeptForRole(role) {
  if(role==="chef")    return "Chef";
  if(role==="stew")    return "Steward";
  if(role==="engineer") return "Engineer";
  if(role==="deck")    return "Deck";
  return "Chef";
}

function AIProvisioningModule({inventory, guests, tasks, role, logAudit}) {
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Provisioning");

  const [charter,setCharter]     = useState({guests:4,nights:5,dietary:"",allergies:"",preferences:"",occasion:""});
  const [loading,setLoading]     = useState(false);
  const [result,setResult]       = useState(null);
  const [history,setHistory]     = useState([]);
  const [activeTab,setActiveTab] = useState("requests");

  const [activeDept,setActiveDept]   = useState(defaultDeptForRole(role));
  const [activeCat,setActiveCat]     = useState("All");
  const [genDept,setGenDept]         = useState(defaultDeptForRole(role));

  const [requests,setRequests]       = useState([]);
  const [showReqForm,setShowReqForm] = useState(false);
  const [reqFilter,setReqFilter]     = useState("All");
  const [reqForm,setReqForm]         = useState({
    item:"", category:PROV_DEPTS[defaultDeptForRole(role)].categories[0],
    qty:1, unit:"Units", urgency:"Normal", notes:"", dept:defaultDeptForRole(role)
  });

  const canApprove = ["captain","management"].includes(role);

  function handleReqCatChange(cat) {
    const dept = deptFromCat(cat);
    setReqForm(p=>({...p, category:cat, dept}));
  }

  function submitRequest() {
    if(!reqForm.item.trim()) return;
    const req = {
      ...reqForm,
      id:`pr_${Date.now()}`,
      status:"Pending",
      requestedBy:role,
      requestedAt:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      approvedBy:null, approvedAt:null,
    };
    setRequests(p=>[req,...p]);
    logA("Provision Request",`${reqForm.item} × ${reqForm.qty} ${reqForm.unit} — ${reqForm.dept}`);
    setShowReqForm(false);
    setReqForm({item:"",category:PROV_DEPTS[activeDept==="All"?"Chef":activeDept].categories[0],qty:1,unit:"Units",urgency:"Normal",notes:"",dept:activeDept==="All"?"Chef":activeDept});
  }

  function approveReq(id, approved) {
    setRequests(p=>p.map(r=>r.id===id?{...r,
      status:approved?"Approved":"Rejected",
      approvedBy:role,
      approvedAt:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"})
    }:r));
    const req = requests.find(r=>r.id===id);
    logA(approved?"Request Approved":"Request Rejected", req?.item||id);
  }

  function deleteReq(id) { setRequests(p=>p.filter(r=>r.id!==id)); }

  const visibleReqs = requests.filter(r=>{
    if(activeDept!=="All" && r.dept!==activeDept) return false;
    if(activeCat!=="All"  && r.category!==activeCat) return false;
    if(reqFilter!=="All"  && r.status!==reqFilter) return false;
    return true;
  });

  function getCatSummary(dept) {
    return (PROV_DEPTS[dept]?.categories||[]).map(cat=>{
      const reqs = requests.filter(r=>r.dept===dept&&r.category===cat);
      return {cat, total:reqs.length, pending:reqs.filter(r=>r.status==="Pending").length, approved:reqs.filter(r=>r.status==="Approved").length};
    }).filter(c=>c.total>0);
  }

  const OCCASIONS = ["General Charter","Owner Trip","Birthday","Honeymoon","Corporate","Family with Children","Fishing Trip","Anniversary"];

  function buildContext() {
    const deptCats = PROV_DEPTS[genDept].categories;
    const invCtx   = inventory.filter(i=>deptCats.some(c=>i.category.toLowerCase().includes(c.toLowerCase())));
    const low      = invCtx.filter(i=>i.qty<i.minQty);
    return `You are a professional yacht ${genDept} provisioning assistant for a luxury superyacht.
Generate a provisioning order for the ${genDept} department organised by: ${deptCats.join(", ")}.
For each item include quantity, unit, and a brief note.
Only order what is needed on top of current stock.

CHARTER: ${charter.guests} guests · ${charter.nights} nights · ${charter.occasion||"General"}
DIETARY: ${charter.dietary||"None"} | ALLERGIES: ${charter.allergies||"None"}
PREFERENCES: ${charter.preferences||"None"}

CURRENT STOCK (${genDept}):
${invCtx.length>0?invCtx.map(i=>`${i.name}: ${i.qty} ${i.unit} (min:${i.minQty})`).join("\n"):"None on file"}

LOW STOCK:
${low.length>0?low.map(i=>`${i.name}: ${i.qty}/${i.minQty} RESTOCK`).join("\n"):"All adequate"}

PENDING REQUESTS (${genDept}):
${requests.filter(r=>r.dept===genDept&&r.status==="Pending").map(r=>`${r.item} × ${r.qty} ${r.unit}`).join("\n")||"None"}

Generate the ${genDept} provisioning list now:`;
  }

  async function generate() {
    setLoading(true); setResult(null); setActiveTab("list");
    logA("AI Provisioning",`${genDept} · ${charter.guests}g · ${charter.nights}n`);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,messages:[{role:"user",content:buildContext()}]})
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"No response.";
      const entry = {id:Date.now(),charter:{...charter},dept:genDept,list:text,timestamp:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"})};
      setResult(entry);
      setHistory(p=>[entry,...p].slice(0,8));
      logA("List Generated",`${genDept} · ${charter.guests}g × ${charter.nights}n`);
    } catch(e) {
      setResult({charter:{...charter},dept:genDept,list:"Connection error.",timestamp:""});
    }
    setLoading(false);
  }

  function formatList(text) {
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:6}}/>;
      const isH = /^[A-Z&\s]{4,}:?\s*$/.test(line.trim())||line.startsWith("===");
      const isB = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const content = parts.map((p,j)=>j%2===1?<strong key={j} style={{color:C.white}}>{p}</strong>:<span key={j}>{p}</span>);
      if(isH) return <div key={i} style={{fontSize:12,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:1,marginTop:14,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>{line.replace(/[=:]/g,"").trim()}</div>;
      return <div key={i} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}>
        {isB&&<span style={{color:C.orange,flexShrink:0,marginTop:2}}>›</span>}
        <span style={{fontSize:12,color:C.text,lineHeight:1.6}}>{content}</span>
      </div>;
    });
  }

  const Lbl = ({children})=><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5,fontWeight:700}}>{children}</div>;
  const inp2 = {...inp,padding:"8px 12px"};
  const urgC = {Critical:C.signal,High:C.amber,Normal:C.greenL,Low:C.muted};

  return <div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}><Ico i={ShoppingCart} s={18} c={C.navy}/>{"Provisioning"}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Department requests · Approval workflow · AI order generation</div>
    </div>

    {/* DEPT TABS */}
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      {["All",...Object.keys(PROV_DEPTS)].map(d=>{
        const info = PROV_DEPTS[d];
        const cnt = d==="All"?requests.filter(r=>r.status==="Pending").length:requests.filter(r=>r.dept===d&&r.status==="Pending").length;
        return <button key={d} onClick={()=>{setActiveDept(d);setActiveCat("All");}}
          style={{...btn,background:activeDept===d?`${info?.color||C.brass}22`:C.navyLight,
            color:activeDept===d?(info?.color||C.brass):C.muted,
            border:`1px solid ${activeDept===d?(info?.color||C.brass)+"66":C.border}`,
            padding:"6px 12px",fontSize:12,fontWeight:activeDept===d?700:400}}>
          {d==="All"?"All Depts":d}
          {cnt>0&&<span style={{marginLeft:5,background:info?.color||C.brass,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px"}}>{cnt}</span>}
        </button>;
      })}
    </div>

    {/* CATEGORY FILTER */}
    {activeDept!=="All"&&<div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
      {["All",...(PROV_DEPTS[activeDept]?.categories||[])].map(cat=>{
        const c=PROV_DEPTS[activeDept]?.color;
        const cnt=cat==="All"?requests.filter(r=>r.dept===activeDept).length:requests.filter(r=>r.dept===activeDept&&r.category===cat).length;
        return <button key={cat} onClick={()=>setActiveCat(cat)}
          style={{...btn,background:activeCat===cat?`${c}22`:C.card,color:activeCat===cat?c:C.muted,
            border:`1px solid ${activeCat===cat?c+"55":C.border}`,padding:"4px 10px",fontSize:11}}>
          {cat}{cnt>0&&<span style={{marginLeft:4,fontSize:9,opacity:.7}}>({cnt})</span>}
        </button>;
      })}
    </div>}

    {/* CATEGORY SUMMARIES */}
    {activeDept!=="All"&&getCatSummary(activeDept).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {getCatSummary(activeDept).map(({cat,total,pending,approved})=>(
        <div key={cat} onClick={()=>setActiveCat(cat)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",minWidth:110}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{cat}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{total}</span>
            {pending>0&&<span style={{fontSize:9,color:C.amber,fontWeight:600}}>{pending} pending</span>}
            {approved>0&&<span style={{fontSize:9,color:C.greenL,fontWeight:600}}>{approved} ✓</span>}
          </div>
        </div>
      ))}
    </div>}

    {/* VIEW TABS */}
    <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:14}}>
      {[["requests","Requests"],["new","AI Order"],["list","Order List"],["history","History"]].map(([id,lbl])=>(
        <button key={id} onClick={()=>setActiveTab(id)} style={{...btn,flex:1,background:activeTab===id?C.card:"transparent",color:activeTab===id?C.navy:C.muted,border:"none",padding:"6px 0",fontSize:11,fontWeight:activeTab===id?700:400}}>{lbl}</button>
      ))}
    </div>

    {/* REQUESTS TAB */}
    {activeTab==="requests"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",background:C.navyLight,borderRadius:7,padding:2,gap:1}}>
          {["All","Pending","Approved","Rejected"].map(f=>(
            <button key={f} onClick={()=>setReqFilter(f)} style={{...btn,background:reqFilter===f?C.card:"transparent",color:reqFilter===f?C.navy:C.muted,border:"none",padding:"4px 9px",fontSize:11}}>
              {f} <span style={{fontSize:9,opacity:.6}}>({requests.filter(r=>(f==="All"||r.status===f)&&(activeDept==="All"||r.dept===activeDept)).length})</span>
            </button>
          ))}
        </div>
        <button onClick={()=>{
          const d=activeDept==="All"?"Chef":activeDept;
          setReqForm({item:"",category:PROV_DEPTS[d].categories[0],qty:1,unit:"Units",urgency:"Normal",notes:"",dept:d});
          setShowReqForm(true);
        }} style={{...btn,background:C.brass,color:C.bg,padding:"6px 14px",fontSize:12,marginLeft:"auto"}}>+ New Request</button>
      </div>

      {visibleReqs.length===0&&<div style={{textAlign:"center",padding:"36px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
        <div>No requests{activeDept!=="All"?` for ${activeDept}`:""}</div>
        <button onClick={()=>setShowReqForm(true)} style={{...btn,background:C.brass,color:C.bg,marginTop:12,padding:"8px 16px"}}>+ Add Request</button>
      </div>}

      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {visibleReqs.map(req=>{
          const dc=PROV_DEPTS[req.dept]?.color||C.muted;
          const sc=req.status==="Approved"?C.greenL:req.status==="Rejected"?C.signal:C.amber;
          return <div key={req.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dc}`,borderRadius:9,padding:"11px 14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:150}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4,alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:700,color:C.text}}>{req.item}</span>
                  <span style={{fontSize:10,background:`${dc}22`,color:dc,padding:"2px 7px",borderRadius:10,fontWeight:600}}>{req.dept}</span>
                  <span style={{fontSize:10,color:C.muted,background:C.navyLight,padding:"2px 7px",borderRadius:10}}>{req.category}</span>
                  {req.urgency!=="Normal"&&<span style={{fontSize:10,color:urgC[req.urgency],fontWeight:700}}>{req.urgency}</span>}
                </div>
                <div style={{fontSize:12,color:C.muted}}>
                  <span style={{color:C.white,fontWeight:600}}>{req.qty} {req.unit}</span>
                  <span style={{margin:"0 6px"}}>·</span>
                  <span>{req.requestedBy} · {req.requestedAt}</span>
                </div>
                {req.notes&&<div style={{fontSize:11,color:C.amber,marginTop:3,fontStyle:"italic"}}>{req.notes}</div>}
                {req.approvedBy&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>{req.status} by {req.approvedBy} · {req.approvedAt}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:700,color:sc,padding:"3px 9px",background:`${sc}18`,border:`1px solid ${sc}44`,borderRadius:10}}>{req.status}</span>
                {canApprove&&req.status==="Pending"&&<>
                  <button onClick={()=>approveReq(req.id,true)}  style={{...btn,background:C.greenL+"22",color:C.greenL,border:`1px solid ${C.greenL}44`,padding:"4px 9px",fontSize:11}}>✓</button>
                  <button onClick={()=>approveReq(req.id,false)} style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"4px 9px",fontSize:11}}>✕</button>
                </>}
                <button onClick={()=>deleteReq(req.id)} style={{...btn,background:"transparent",color:C.muted,border:"none",padding:"4px 5px",fontSize:13}}>🗑</button>
              </div>
            </div>
          </div>;
        })}
      </div>

      {/* NEW REQUEST MODAL */}
      {showReqForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:16}} onClick={()=>setShowReqForm(false)}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:420,maxWidth:"96vw",padding:22}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:800,color:C.navy}}>New Provision Request</div>
            <button onClick={()=>setShowReqForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>
          </div>

          <Lbl>Department</Lbl>
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            {Object.entries(PROV_DEPTS).map(([d,info])=>(
              <button key={d} onClick={()=>setReqForm(p=>({...p,dept:d,category:info.categories[0]}))}
                style={{...btn,background:reqForm.dept===d?`${info.color}22`:C.navyLight,color:reqForm.dept===d?info.color:C.muted,
                  border:`1px solid ${reqForm.dept===d?info.color+"55":C.border}`,padding:"5px 11px",fontSize:11}}>
                <span style={{display:"flex",alignItems:"center",gap:5}}>{info.IconC&&<Ico i={info.IconC} s={12} c={info.color}/>}{d}</span>
              </button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <div style={{marginBottom:11,gridColumn:"1/-1"}}>
              <Lbl>Item Name</Lbl>
              <input value={reqForm.item} onChange={e=>setReqForm(p=>({...p,item:e.target.value}))}
                placeholder="e.g. Olive Oil Extra Virgin" style={{...inp2,width:"100%"}}/>
            </div>
            <div style={{marginBottom:11}}>
              <Lbl>Category</Lbl>
              <select value={reqForm.category} onChange={e=>setReqForm(p=>({...p,category:e.target.value}))} style={{...inp2,width:"100%"}}>
                {(PROV_DEPTS[reqForm.dept]?.categories||[]).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:11}}>
              <Lbl>Urgency</Lbl>
              <select value={reqForm.urgency} onChange={e=>setReqForm(p=>({...p,urgency:e.target.value}))} style={{...inp2,width:"100%"}}>
                {["Low","Normal","High","Critical"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={{marginBottom:11}}>
              <Lbl>Quantity</Lbl>
              <input type="number" min={1} value={reqForm.qty} onChange={e=>setReqForm(p=>({...p,qty:Number(e.target.value)}))} style={{...inp2,width:"100%"}}/>
            </div>
            <div style={{marginBottom:11}}>
              <Lbl>Unit</Lbl>
              <select value={reqForm.unit} onChange={e=>setReqForm(p=>({...p,unit:e.target.value}))} style={{...inp2,width:"100%"}}>
                {["Units","L","Kg","Bottles","Cans","Boxes","Sets","Cases","Rolls","Metres"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14,gridColumn:"1/-1"}}>
              <Lbl>Notes (optional)</Lbl>
              <input value={reqForm.notes} onChange={e=>setReqForm(p=>({...p,notes:e.target.value}))}
                placeholder="Brand, spec, urgency reason…" style={{...inp2,width:"100%"}}/>
            </div>
          </div>

          <div style={{background:C.navyLight,borderRadius:6,padding:"6px 10px",marginBottom:14,fontSize:11,color:C.muted}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}>{PROV_DEPTS[reqForm.dept]?.IconC&&<Ico i={PROV_DEPTS[reqForm.dept].IconC} s={13} c={PROV_DEPTS[reqForm.dept]?.color}/>}<span>Assigned to <strong style={{color:PROV_DEPTS[reqForm.dept]?.color}}>{reqForm.dept}</strong></span></span> · <strong style={{color:C.text}}>{reqForm.category}</strong>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowReqForm(false)} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`}}>Cancel</button>
            <button onClick={submitRequest} disabled={!reqForm.item.trim()} style={{...btn,flex:2,background:C.brass,color:C.bg,opacity:reqForm.item.trim()?1:.5}}>Submit Request</button>
          </div>
        </div>
      </div>}
    </div>}

    {/* AI ORDER TAB */}
    {activeTab==="new"&&<div style={{maxWidth:560}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>AI Order Generator</div>

        <Lbl>Department</Lbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {Object.entries(PROV_DEPTS).map(([d,info])=>(
            <button key={d} onClick={()=>setGenDept(d)}
              style={{...btn,background:genDept===d?`${info.color}22`:C.navyLight,color:genDept===d?info.color:C.muted,
                border:`1px solid ${genDept===d?info.color+"55":C.border}`,padding:"6px 13px",fontSize:12}}>
              {info.icon} {d}
            </button>
          ))}
        </div>
        {genDept&&<div style={{fontSize:10,color:C.muted,marginBottom:12}}>Categories: {PROV_DEPTS[genDept].categories.join(" · ")}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px",marginBottom:12}}>
          <div><Lbl>Guests</Lbl><input type="number" min={1} max={20} value={charter.guests} onChange={e=>setCharter(p=>({...p,guests:Number(e.target.value)}))} style={inp2}/></div>
          <div><Lbl>Nights</Lbl><input type="number" min={1} max={30} value={charter.nights} onChange={e=>setCharter(p=>({...p,nights:Number(e.target.value)}))} style={inp2}/></div>
        </div>

        <div style={{marginBottom:12}}>
          <Lbl>Occasion</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {OCCASIONS.map(o=><button key={o} onClick={()=>setCharter(p=>({...p,occasion:o}))}
              style={{...btn,background:charter.occasion===o?C.orange:C.navyLight,color:charter.occasion===o?C.bg:C.muted,
                border:`1px solid ${charter.occasion===o?C.orange:C.border}`,padding:"4px 10px",fontSize:11}}>{o}</button>)}
          </div>
        </div>

        {genDept==="Chef"&&<>
          <div style={{marginBottom:10}}><Lbl>Dietary</Lbl><input value={charter.dietary} onChange={e=>setCharter(p=>({...p,dietary:e.target.value}))} placeholder="Vegan, Halal, Gluten-free…" style={{...inp2,width:"100%"}}/></div>
          <div style={{marginBottom:10}}><Lbl>Allergies</Lbl><input value={charter.allergies} onChange={e=>setCharter(p=>({...p,allergies:e.target.value}))} placeholder="Nuts, shellfish…" style={{...inp2,width:"100%"}}/></div>
          <div style={{marginBottom:12}}><Lbl>Preferences</Lbl><input value={charter.preferences} onChange={e=>setCharter(p=>({...p,preferences:e.target.value}))} placeholder="Prefers red wine…" style={{...inp2,width:"100%"}}/></div>
        </>}

        <button onClick={generate} disabled={loading}
          style={{...btn,background:PROV_DEPTS[genDept]?.color||C.orange,color:C.bg,width:"100%",padding:"11px 0",fontWeight:700,fontSize:13,opacity:loading?.7:1,marginTop:4}}>
          {loading?`Generating ${genDept} list…`:`Generate ${genDept} Order List`}
        </button>
      </div>
    </div>}

    {/* LIST TAB */}
    {activeTab==="list"&&<div>
      {loading&&<div style={{textAlign:"center",padding:"40px 0"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ShoppingCart} s={32} c={C.muted}/></div>
        <div style={{fontSize:13,color:C.text,fontWeight:600}}>Generating {genDept} list…</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Checking inventory · Calculating quantities</div>
      </div>}
      {!loading&&!result&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
        <button onClick={()=>setActiveTab("new")} style={{...btn,background:C.brass,color:C.bg,marginTop:8}}>Generate Order List</button>
      </div>}
      {!loading&&result&&<div>
        <div style={{background:C.card,border:`1px solid ${(PROV_DEPTS[result.dept]?.color||C.orange)+"44"}`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Ico i={PROV_DEPTS[result.dept]?.IconC||ShoppingCart} s={20} c={PROV_DEPTS[result.dept]?.color||C.orange}/></div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.text,fontSize:13}}>{result.dept} · {result.charter.guests} guests · {result.charter.nights} nights{result.charter.occasion?` · ${result.charter.occasion}`:""}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Generated {result.timestamp}</div>
          </div>
          <button onClick={()=>setActiveTab("new")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:11}}>New List</button>
        </div>
        {(result.charter.dietary||result.charter.allergies)&&<div style={{background:C.signal+"12",border:`1px solid ${C.signal}33`,borderRadius:8,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.signal,marginBottom:4}}>⚠ Dietary Flags</div>
          {result.charter.dietary&&<div style={{fontSize:12,color:C.text}}>Dietary: {result.charter.dietary}</div>}
          {result.charter.allergies&&<div style={{fontSize:12,color:C.signal,fontWeight:600}}>Allergies: {result.charter.allergies}</div>}
        </div>}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>{formatList(result.list)}</div>
      </div>}
    </div>}

    {/* HISTORY TAB */}
    {activeTab==="history"&&<div>
      {history.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Clock} s={28} c={C.muted}/></div>No lists generated yet.</div>}
      {history.map(h=>(
        <div key={h.id} onClick={()=>{setResult(h);setActiveTab("list");}}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 16px",marginBottom:8,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.orange+"66"}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                <span style={{fontWeight:600,color:C.text,fontSize:13}}>{h.dept} · {h.charter.guests}g · {h.charter.nights}n</span>
                {h.charter.occasion&&<span style={{fontSize:10,color:PROV_DEPTS[h.dept]?.color,background:`${PROV_DEPTS[h.dept]?.color}22`,padding:"1px 7px",borderRadius:8}}>{h.charter.occasion}</span>}
              </div>
              <div style={{fontSize:11,color:C.muted}}>{h.timestamp}</div>
            </div>
            <span style={{color:C.muted,fontSize:14}}>›</span>
          </div>
        </div>
      ))}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// FLOATING AI BUTTON — context-aware per module
// ═══════════════════════════════════════════════════════════════
function FloatingAI({label, icon, color, children}) {
  const [open, setOpen] = useState(false);
  return <>
    {/* Floating button */}
    <button onClick={()=>setOpen(true)} title={`AI: ${label}`}
      style={{position:"fixed",bottom:80,right:18,zIndex:200,
        width:52,height:52,borderRadius:"50%",
        background:`linear-gradient(135deg,${color||C.brass},${color?color+"cc":C.brassL})`,
        border:`2px solid ${color||C.brass}66`,
        boxShadow:`0 4px 20px ${color||C.brass}44`,
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform .15s,box-shadow .15s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
    ><Ico i={Bot} s={24} c={C.bg}/></button>

    {/* Drawer overlay */}
    {open&&<div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"flex-end"}}
      onClick={()=>setOpen(false)}>
      <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.6)",backdropFilter:"blur(3px)"}}/>
      <div style={{position:"relative",zIndex:1,background:C.card,border:`1px solid ${color||C.brass}44`,
        borderRadius:"16px 0 0 0",width:"min(580px,100vw)",height:"85vh",
        display:"flex",flexDirection:"column",boxShadow:`-4px 0 40px rgba(0,0,0,.5)`}}
        onClick={e=>e.stopPropagation()}>

        {/* Drawer header */}
        <div style={{padding:"14px 18px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:`${color||C.brass}22`,border:`2px solid ${color||C.brass}55`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico i={Bot} s={16} c={color||C.brass}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:C.navy}}>{label} AI</div>
            <div style={{fontSize:10,color:C.muted}}>Powered by Claude · Live vessel data</div>
          </div>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:0,lineHeight:1}}>×</button>
        </div>

        {/* Drawer content — scrollable */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 18px 24px"}}>
          {children}
        </div>
      </div>
    </div>}
  </>;
}

// ═══════════════════════════════════════════════════════════════
// AI HUB — wrapper for all AI modules
// ═══════════════════════════════════════════════════════════════
function AIHub({tasks,setTasks,crew,docs,assets,inventory,logbook,jobs,guests,role,logAudit}) {
  const [aiView,setAiView] = useState("readiness");

  const AI_TABS = [
    {id:"readiness",    label:"Readiness Check",      IconC:CheckCircle, color:C.brass},
    {id:"maintenance",  label:"Maintenance Assistant", IconC:Wrench,      color:C.blue},
    {id:"provisioning", label:"Provisioning",          IconC:ShoppingCart,color:C.orange},
    {id:"taskgen",      label:"Task Generator",        IconC:ClipboardList,color:C.purple},
    {id:"docqa",        label:"Document Q&A",          IconC:FileText,    color:C.greenL},
    {id:"incident",     label:"Incident Report",       IconC:AlertTriangle,color:C.signal},
    {id:"handover",     label:"Handover Brief",        IconC:Send,        color:C.brassL},
  ];

  return <div>
    {/* AI Hub header */}
    <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,border:`1px solid ${C.brass}33`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:40,height:40,borderRadius:"50%",background:C.brass+"22",border:`2px solid ${C.brass}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Ico i={Bot} s={20} c={C.brass}/>
      </div>
      <div>
        <div style={{fontSize:16,fontWeight:800,color:C.white}}>Bridge AI Assistant</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>Powered by Claude · Live vessel data · 3 assistants available</div>
      </div>
    </div>

    {/* Sub-nav */}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {AI_TABS.map(t=>(
        <button key={t.id} onClick={()=>setAiView(t.id)} style={{...btn,background:aiView===t.id?t.color+"22":C.navyLight,color:aiView===t.id?t.color:C.muted,border:`1px solid ${aiView===t.id?t.color+"66":C.border}`,padding:"8px 16px",fontSize:12,display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
          <Ico i={t.IconC} s={13} c={aiView===t.id?t.color:C.muted}/>{t.label}
        </button>
      ))}
    </div>

    {aiView==="readiness"    &&<AIReadinessModule    tasks={tasks} crew={crew} docs={docs} assets={assets} inventory={inventory} logbook={logbook} role={role} logAudit={logAudit}/>}
    {aiView==="maintenance"  &&<AIMaintenanceModule  assets={assets} jobs={jobs} tasks={tasks} role={role} logAudit={logAudit}/>}
    {aiView==="provisioning" &&<AIProvisioningModule inventory={inventory} guests={guests} tasks={tasks} role={role} logAudit={logAudit}/>}
    {aiView==="taskgen"      &&<AITaskGeneratorModule tasks={tasks} setTasks={setTasks} crew={crew} role={role} logAudit={logAudit}/>}
    {aiView==="docqa"        &&<AIDocQAModule docs={docs} role={role} logAudit={logAudit}/>}
    {aiView==="incident"     &&<AIIncidentReportModule crew={crew} logbook={logbook} role={role} logAudit={logAudit}/>}
    {aiView==="handover"     &&<AIHandoverModule tasks={tasks} crew={crew} docs={docs} assets={assets} inventory={inventory} guests={guests} logbook={logbook} role={role} logAudit={logAudit}/>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #4 — TASK GENERATOR
// ═══════════════════════════════════════════════════════════════
function AITaskGeneratorModule({tasks, setTasks, crew, role, logAudit}) {
  const [situation, setSituation] = useState("");
  const [context, setContext]     = useState({type:"charter", days:5, guests:4, special:""});
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState([]);
  const [selected, setSelected]   = useState([]);
  const [imported, setImported]   = useState(false);
  const [history, setHistory]     = useState([]);
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Task Generator");

  const SITUATIONS = [
    {label:"Owner Arrival",     icon:"⚓", desc:"Prepare vessel for owner and family"},
    {label:"Charter Start",     icon:"🛥️", desc:"Full crew prep for incoming charter guests"},
    {label:"Post-Charter",      icon:"🧹", desc:"Turnover tasks after guests depart"},
    {label:"Drydock Prep",      icon:"🔧", desc:"Prepare vessel for haul-out and maintenance"},
    {label:"Safety Inspection", icon:"🛡️", desc:"Full flag state or port state compliance check"},
    {label:"Storm Prep",        icon:"⛈️", desc:"Secure vessel for heavy weather"},
    {label:"Seasonal Layup",    icon:"❄️", desc:"End of season layup and storage"},
    {label:"Return to Service", icon:"✅", desc:"Recommission after layup or drydock"},
  ];

  function buildPrompt() {
    const crewList = ["captain","engineer","stew","deckhand","chef"]
      .map(r=>`${ROLES[r]?.label}: ${crew.filter(c=>c.role===r&&c.onboard).length>0?"onboard":"not onboard"}`)
      .join(", ");
    const existingOverdue = tasks.filter(t=>t.status==="Overdue").length;

    return `You are an expert yacht operations manager for a professional superyacht.
Generate a comprehensive, practical task list for the situation described below.
Assign each task to the correct crew role based on their department.

IMPORTANT — Respond ONLY with valid JSON. No preamble, no explanation, no markdown fences.
Format exactly as this array:
[
  {
    "title": "task title",
    "desc": "detailed instructions",
    "assignedTo": "captain|engineer|stew|deckhand|chef",
    "dept": "Captain|Engineering|Interior|Deck|Galley",
    "priority": "Critical|High|Medium|Low",
    "category": "category name",
    "recurrence": "One-off",
    "dueDate": "days from today as number 0-7",
    "notes": "any important notes or warnings"
  }
]

Generate 15-25 tasks covering all relevant departments.
Make tasks specific and actionable — not generic.
Consider the vessel context and crew availability.

=== VESSEL CONTEXT ===
Situation: ${situation||context.type}
Charter type / occasion: ${context.type}
Number of guests: ${context.guests}
Duration: ${context.days} days
Special requirements: ${context.special||"None"}
Crew available: ${crewList}
Currently overdue tasks: ${existingOverdue}

Generate the task list now (JSON array only):`;
  }

  async function generate() {
    if(!situation.trim()&&!context.type) return;
    setLoading(true);
    setGenerated([]);
    setSelected([]);
    setImported(false);
    logA("Task Generation Request", situation||context.type);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:2000,
          messages:[{role:"user", content:buildPrompt()}]
        })
      });
      const data = await res.json();
      let text = data.content?.[0]?.text||"[]";
      text = text.replace(/```json|```/g,"").trim();

      let parsed = [];
      try { parsed = JSON.parse(text); } catch(e) { parsed = []; }

      // Enrich with IDs and proper dates
      const TODAY_DATE = new Date().toISOString().split("T")[0];
      const enriched = parsed.map((t,i)=>{
        const due = new Date();
        due.setDate(due.getDate()+(Number(t.dueDate)||0));
        return {
          ...t,
          id:`gen_${Date.now()}_${i}`,
          dueDate: due.toISOString().split("T")[0],
          status:"Pending",
          assignedBy:role,
          photos:[],
          completedAt:null,
          approvedBy:null,
          recurrence:t.recurrence||"One-off",
        };
      });

      setGenerated(enriched);
      setSelected(enriched.map(t=>t.id));
      setHistory(p=>[{id:Date.now(),situation:situation||context.type,count:enriched.length,tasks:enriched,timestamp:new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})},...p].slice(0,5));
      logA("Tasks Generated", `${enriched.length} tasks generated for: ${situation||context.type}`);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }

  function importTasks() {
    const toImport = generated.filter(t=>selected.includes(t.id));
    setTasks(p=>[...p,...toImport]);
    setImported(true);
    logA("Tasks Imported", `${toImport.length} AI-generated tasks added to task list`);
  }

  function toggleAll() {
    setSelected(selected.length===generated.length?[]:generated.map(t=>t.id));
  }

  const deptColor = {Captain:C.brassL,Engineering:C.blue,Interior:C.purple,Deck:C.greenL,Galley:C.orange};
  const priColor  = {Critical:C.signal,High:"#f87171",Medium:C.amber,Low:C.greenL};

  return <div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Task Generator</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Describe a situation — AI generates a full task list pre-assigned to the right crew</div>
    </div>

    {/* Situation quick-pick */}
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Quick Situations</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
        {SITUATIONS.map(s=>(
          <button key={s.label} onClick={()=>{setSituation(s.desc);setContext(p=>({...p,type:s.label}));}}
            style={{...btn,background:situation===s.desc?C.navyMid:C.card,border:`1px solid ${situation===s.desc?C.brass:C.border}`,color:situation===s.desc?C.white:C.text,padding:"10px 12px",textAlign:"left",display:"flex",gap:8,alignItems:"flex-start",transition:"all .15s"}}>
            <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:situation===s.desc?C.brass:C.white}}>{s.label}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>{s.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Custom description + params */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Describe the Situation</div>
      <textarea value={situation} onChange={e=>setSituation(e.target.value)}
        placeholder="e.g. Owner arriving Friday with 4 guests for a 5-night Mediterranean cruise. One guest is gluten-free. Formal dinner planned on day 2."
        rows={3} style={{...inp,resize:"vertical",width:"100%",boxSizing:"border-box",marginBottom:12}}/>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:100}}>
          <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Guests</label>
          <input type="number" min={0} max={20} value={context.guests}
            onChange={e=>setContext(p=>({...p,guests:Number(e.target.value)}))}
            style={{...inp,padding:"7px 10px"}}/>
        </div>
        <div style={{flex:1,minWidth:100}}>
          <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Days</label>
          <input type="number" min={1} max={60} value={context.days}
            onChange={e=>setContext(p=>({...p,days:Number(e.target.value)}))}
            style={{...inp,padding:"7px 10px"}}/>
        </div>
        <div style={{flex:2,minWidth:180}}>
          <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Special Requirements</label>
          <input value={context.special} onChange={e=>setContext(p=>({...p,special:e.target.value}))}
            placeholder="e.g. gluten-free, formal dinner, water toys"
            style={{...inp,padding:"7px 10px"}}/>
        </div>
      </div>

      <button onClick={generate} disabled={loading||!situation.trim()}
        style={{...btn,background:situation.trim()&&!loading?C.brass:C.navyLight,color:situation.trim()&&!loading?C.bg:C.muted,width:"100%",padding:"11px",fontSize:14,fontWeight:700,marginTop:14,opacity:loading?.7:1,transition:"all .15s"}}>
        {loading?"Generating tasks…":"Generate Task List"}
      </button>
    </div>

    {/* Loading */}
    {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,textAlign:"center",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
      <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>AI is building your task list…</div>
      <div style={{fontSize:11,color:C.muted}}>Assigning tasks to the right crew members</div>
    </div>}

    {/* Generated tasks */}
    {!loading&&generated.length>0&&<div>
      {/* Import bar */}
      <div style={{background:C.navyMid,border:`1px solid ${C.brass}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <input type="checkbox" checked={selected.length===generated.length} onChange={toggleAll} style={{cursor:"pointer",width:16,height:16}}/>
        <span style={{fontSize:12,color:C.brass,fontWeight:700}}>{selected.length} of {generated.length} tasks selected</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {imported
            ? <div style={{fontSize:12,color:C.greenL,fontWeight:600}}>✓ {selected.length} tasks added to task list</div>
            : <button onClick={importTasks} disabled={selected.length===0}
                style={{...btn,background:selected.length>0?C.brass:C.navyLight,color:selected.length>0?C.bg:C.muted,padding:"6px 16px",fontSize:12}}>
                Import {selected.length} Task{selected.length!==1?"s":""}
              </button>}
        </div>
      </div>

      {/* Dept summary */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {Object.entries(generated.reduce((acc,t)=>{acc[t.dept]=(acc[t.dept]||0)+1;return acc;},{})).map(([dept,count])=>(
          <div key={dept} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:deptColor[dept]||C.muted}}/>
            <span style={{fontSize:11,color:C.text}}>{dept}</span>
            <span style={{fontSize:11,fontWeight:700,color:deptColor[dept]||C.muted}}>{count}</span>
          </div>
        ))}
      </div>

      {/* Task rows */}
      {["Critical","High","Medium","Low"].map(pri=>{
        const pt = generated.filter(t=>t.priority===pri);
        if(!pt.length) return null;
        return <div key={pri} style={{marginBottom:16}}>
          <div style={{fontSize:10,color:priColor[pri],fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>
            {pri} Priority ({pt.length})
          </div>
          {pt.map(t=>{
            const isSel = selected.includes(t.id);
            const dc    = deptColor[t.dept]||C.muted;
            return <div key={t.id} style={{background:isSel?C.navyMid:C.card,border:`1px solid ${isSel?C.brass+"55":C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:6,display:"flex",gap:10,alignItems:"flex-start",transition:"all .12s"}}>
              <input type="checkbox" checked={isSel}
                onChange={()=>setSelected(p=>p.includes(t.id)?p.filter(x=>x!==t.id):[...p,t.id])}
                style={{cursor:"pointer",marginTop:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:5,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
                  <Pill label={t.dept} bg={dc+"22"} color={dc} small/>
                  <Pill label={ROLES[t.assignedTo]?.label||t.assignedTo} bg={C.navyLight} color={C.muted} small/>
                  <Pill label={`Due: ${t.dueDate}`} bg={C.navyLight} color={C.muted} small/>
                </div>
                <div style={{fontWeight:600,color:C.text,fontSize:13}}>{t.title}</div>
                {t.desc&&<div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{t.desc}</div>}
                {t.notes&&<div style={{fontSize:11,color:C.amber,marginTop:3}}>⚠ {t.notes}</div>}
              </div>
            </div>;
          })}
        </div>;
      })}
    </div>}

    {/* History */}
    {!loading&&generated.length===0&&history.length>0&&<div>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Recent Generations</div>
      {history.map(h=>(
        <div key={h.id} onClick={()=>{setGenerated(h.tasks);setSelected(h.tasks.map(t=>t.id));setImported(false);}}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:6,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.brass+"66"}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{fontWeight:600,color:C.text,fontSize:13}}>{h.situation}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{h.count} tasks · {h.timestamp}</div>
        </div>
      ))}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #5 — DOCUMENT Q&A
// ═══════════════════════════════════════════════════════════════
function AIDocQAModule({docs, role, logAudit}) {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [activeDoc, setActiveDoc]       = useState(null);
  const [query, setQuery]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [conversation, setConversation] = useState([]);
  const [uploading, setUploading]       = useState(false);
  const fileRef = useRef(null);
  const chatRef = useRef(null);
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Document Q&A");

  const QUICK_QS = {
    manual:    ["What is the recommended oil specification?","What is the service interval?","How do I reset the alarm?","What are the torque settings?","What parts are needed for the 250hr service?"],
    insurance: ["What is the coverage limit?","What is excluded from this policy?","What is the deductible?","How do I make a claim?","Is racing or delivery covered?"],
    cert:      ["When does this certificate expire?","What authority issued this?","What vessel does this cover?","What conditions apply?"],
    contract:  ["What is the notice period?","What are the termination conditions?","What is the salary or rate?","What are the leave entitlements?"],
    default:   ["Summarise this document","What are the key dates?","What actions are required?","Who needs to sign this?","What is the expiry or renewal date?"],
  };

  function getQuickQs(doc) {
    if(!doc) return QUICK_QS.default;
    const n = doc.name.toLowerCase();
    if(n.includes("manual")||n.includes("engine")||n.includes("generator")||n.includes("service")) return QUICK_QS.manual;
    if(n.includes("insurance")||n.includes("hull")||n.includes("p&i")) return QUICK_QS.insurance;
    if(n.includes("cert")||n.includes("licence")||n.includes("registration")) return QUICK_QS.cert;
    if(n.includes("contract")||n.includes("agreement")||n.includes("crew")) return QUICK_QS.contract;
    return QUICK_QS.default;
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if(!files.length) return;
    setUploading(true);
    const newDocs = [];
    for(const file of files) {
      const base64 = await new Promise((res,rej)=>{
        const r = new FileReader();
        r.onload = ev => res(ev.target.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      newDocs.push({
        id:`qdoc_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
        name: file.name,
        size: `${(file.size/1024).toFixed(0)} KB`,
        type: file.type,
        base64,
      });
    }
    setUploadedDocs(p=>[...p,...newDocs]);
    if(!activeDoc) setActiveDoc(newDocs[0]);
    setConversation([]);
    setUploading(false);
    logA("Document Uploaded", files.map(f=>f.name).join(", "));
    e.target.value = "";
  }

  async function ask(q) {
    const question = q||query;
    if(!question.trim()||!activeDoc) return;
    setLoading(true);
    setQuery("");

    const userMsg = {role:"user", text:question, ts:new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})};
    setConversation(p=>[...p,userMsg]);
    logA("Document Q&A", `${activeDoc.name}: ${question}`);

    // Build message history for multi-turn
    const apiMessages = [];

    // First message always includes the document
    const firstUserContent = [
      {type:"document", source:{type:"base64", media_type: activeDoc.type==="application/pdf"?"application/pdf":"image/jpeg", data:activeDoc.base64}},
      {type:"text", text:`You are an expert document analyst for a professional superyacht operation.
The user has uploaded a document. Answer questions based strictly on its contents.
Be specific, quote relevant sections when helpful, and flag anything that requires urgent action (expiry, compliance, safety).
If a question cannot be answered from the document, say so clearly.

Question: ${conversation.length===0?question:"Please answer based on the document already provided."}`}
    ];

    // Multi-turn: include previous conversation
    if(conversation.length===0) {
      apiMessages.push({role:"user", content:firstUserContent});
    } else {
      // First turn with doc
      apiMessages.push({role:"user", content:firstUserContent});
      // Previous assistant responses
      conversation.forEach((msg,i)=>{
        if(i===0) return; // skip first user msg — already in above
        if(msg.role==="assistant") apiMessages.push({role:"assistant", content:msg.text});
        else if(i>0) apiMessages.push({role:"user", content:msg.text});
      });
      apiMessages.push({role:"user", content:question});
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6", max_tokens:1000, messages:apiMessages})
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"No response.";
      const aiMsg = {role:"assistant", text, ts:new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})};
      setConversation(p=>[...p,aiMsg]);
    } catch(e) {
      setConversation(p=>[...p,{role:"assistant",text:"Connection error. Please try again.",ts:""}]);
    }
    setLoading(false);
    setTimeout(()=>chatRef.current?.scrollTo({top:9999,behavior:"smooth"}),100);
  }

  function formatMsg(text) {
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:5}}/>;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const content = parts.map((p,j)=>j%2===1
        ?<strong key={j} style={{color:C.white,fontWeight:700}}>{p}</strong>
        :<span key={j}>{p}</span>);
      const isBullet = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      return <div key={i} style={{display:"flex",gap:6,marginBottom:3,alignItems:"flex-start"}}>
        {isBullet&&<span style={{color:C.purple,flexShrink:0}}>›</span>}
        <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{content}</span>
      </div>;
    });
  }

  function switchDoc(doc) {
    setActiveDoc(doc);
    setConversation([]);
    setQuery("");
  }

  return <div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Document Q&A</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Upload any manual, certificate, or contract — ask questions directly from it</div>
    </div>

    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>

      {/* LEFT — doc list */}
      <div style={{width:210,flexShrink:0}}>
        <button onClick={()=>fileRef.current.click()} disabled={uploading}
          style={{...btn,background:C.brass,color:C.bg,width:"100%",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {uploading?"Uploading…":"Upload Document"}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleUpload} style={{display:"none"}}/>

        {uploadedDocs.length===0&&<div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:9,padding:16,textAlign:"center",color:C.muted,fontSize:12}}>
          Upload a PDF or image to begin
        </div>}

        {uploadedDocs.length>0&&<>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Uploaded Documents</div>
          {uploadedDocs.map(doc=>(
            <button key={doc.id} onClick={()=>switchDoc(doc)}
              style={{display:"flex",alignItems:"flex-start",gap:8,width:"100%",padding:"9px 10px",background:activeDoc?.id===doc.id?C.navyLight:"transparent",border:`1px solid ${activeDoc?.id===doc.id?C.purple+"88":C.border}`,borderRadius:7,cursor:"pointer",marginBottom:5,textAlign:"left"}}>
              <div style={{flexShrink:0}}><Ico i={doc.type==="application/pdf"?FileText:Image} s={16} c={C.muted}/></div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,color:activeDoc?.id===doc.id?C.white:C.text,fontWeight:activeDoc?.id===doc.id?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                <div style={{fontSize:9,color:C.muted}}>{doc.size}</div>
              </div>
            </button>
          ))}

          {/* Remove all */}
          <button onClick={()=>{setUploadedDocs([]);setActiveDoc(null);setConversation([]);}}
            style={{...btn,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:10,width:"100%",marginTop:4}}>
            Clear All
          </button>
        </>}

        {/* Vault docs note */}
        <div style={{marginTop:14,background:C.navyLight,borderRadius:8,padding:"10px 12px",fontSize:11,color:C.muted,lineHeight:1.5}}>
          {"Upload PDFs directly — engine manuals, safety certificates, insurance docs, crew contracts"}
        </div>
      </div>

      {/* RIGHT — chat */}
      <div style={{flex:1,minWidth:0}}>
        {!activeDoc&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:36,textAlign:"center",color:C.muted}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={FileText} s={36} c={C.muted}/></div>
          <div style={{fontSize:14,color:C.text,fontWeight:600,marginBottom:4}}>Upload a document to begin</div>
          <div style={{fontSize:12,marginBottom:16}}>Supports PDF, JPG, PNG — manuals, certificates, contracts, reports</div>
          <button onClick={()=>fileRef.current.click()} style={{...btn,background:C.brass,color:C.bg}}>Upload Document</button>
        </div>}

        {activeDoc&&<>
          {/* Doc header */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <Ico i={activeDoc.type==="application/pdf"?FileText:Image} s={20} c={C.muted}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,color:C.text,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeDoc.name}</div>
              <div style={{fontSize:10,color:C.muted}}>{activeDoc.size} · Ask anything about this document</div>
            </div>
            {conversation.length>0&&<button onClick={()=>setConversation([])} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"3px 10px",fontSize:10}}>Clear Chat</button>}
          </div>

          {/* Quick questions */}
          {conversation.length===0&&<div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Quick Questions</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {getQuickQs(activeDoc).map((q,i)=>(
                <button key={i} onClick={()=>ask(q)} disabled={loading}
                  style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 10px",fontSize:11,opacity:loading?.6:1}}>
                  {q}
                </button>
              ))}
            </div>
          </div>}

          {/* Conversation */}
          {conversation.length>0&&<div ref={chatRef} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:12,maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
            {conversation.map((msg,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",flexDirection:msg.role==="user"?"row-reverse":"row"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:msg.role==="user"?C.navyLight:C.purple+"22",border:`2px solid ${msg.role==="user"?C.border:C.purple+"55"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ico i={msg.role==="user"?User:Bot} s={13} c={msg.role==="user"?C.muted:C.purple}/>
                </div>
                <div style={{maxWidth:"80%",background:msg.role==="user"?C.navyLight:C.navy,border:`1px solid ${msg.role==="user"?C.border:C.purple+"33"}`,borderRadius:msg.role==="user"?"10px 2px 10px 10px":"2px 10px 10px 10px",padding:"9px 12px"}}>
                  {msg.role==="assistant"?formatMsg(msg.text):<span style={{fontSize:13,color:C.text}}>{msg.text}</span>}
                  {msg.ts&&<div style={{fontSize:9,color:C.muted,marginTop:4,textAlign:msg.role==="user"?"left":"right"}}>{msg.ts}</div>}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.purple+"22",border:`2px solid ${C.purple}55`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico i={Bot} s={13} c={C.purple}/>
              </div>
              <div style={{background:C.navy,border:`1px solid ${C.purple}33`,borderRadius:"2px 10px 10px 10px",padding:"10px 14px",display:"flex",gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.purple,opacity:.4}}/>)}
              </div>
            </div>}
          </div>}

          {/* Input */}
          <div style={{display:"flex",gap:8}}>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!loading&&ask()}
              placeholder={`Ask anything about ${activeDoc.name}…`}
              style={{...inp,flex:1,padding:"10px 14px",fontSize:13}}/>
            <button onClick={()=>ask()} disabled={loading||!query.trim()}
              style={{...btn,background:query.trim()&&!loading?C.purple:C.navyLight,color:query.trim()&&!loading?"white":C.muted,padding:"10px 20px",flexShrink:0,transition:"all .15s"}}>
              {loading?"…":"Ask"}
            </button>
          </div>
        </>}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #6 — INCIDENT REPORT WRITER
// ═══════════════════════════════════════════════════════════════
function AIIncidentReportModule({crew, logbook, role, logAudit}) {
  const [form, setForm]           = useState({
    incidentType:"",
    date: new Date().toISOString().split("T")[0],
    time:"",
    location:"",
    description:"",
    injuries:"None",
    damage:"None",
    witnesses:"",
    immediateAction:"",
    reportedTo:"",
  });
  const [loading, setLoading]     = useState(false);
  const [report, setReport]       = useState(null);
  const [saved, setSaved]         = useState([]);
  const [view, setView]           = useState("form"); // form | report | saved
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Incident Report");

  const INCIDENT_TYPES = [
    "Man Overboard (MOB)","Fire / Smoke","Flooding / Water Ingress","Collision",
    "Grounding","Medical Emergency","Machinery Failure","Fuel Spill / Pollution",
    "Personal Injury","Property Damage","Security Incident","Near Miss",
    "Adverse Weather Damage","Electrical Fault","Other",
  ];

  const crewOnboard = crew.filter(c=>c.onboard).map(c=>c.name).join(", ")||"Not recorded";

  function buildPrompt() {
    return `You are a professional maritime incident report writer for a superyacht.
Write a formal, professional incident report based on the information below.
The report must be clear, factual, and suitable for submission to flag state, insurance, or port authority.

Use this exact structure with these section headers:

INCIDENT REPORT — [INCIDENT TYPE]
Report Reference: IR-${Date.now().toString().slice(-6)}
Date of Report: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}

SECTION 1 — INCIDENT DETAILS
(Date, time, location, type of incident)

SECTION 2 — VESSEL INFORMATION
(Vessel name: M/Y Tiberias, Flag state, Crew onboard at time)

SECTION 3 — DESCRIPTION OF INCIDENT
(Full chronological account of what happened — use professional maritime language)

SECTION 4 — PERSONS INVOLVED
(Crew, guests, witnesses)

SECTION 5 — INJURIES & MEDICAL
(Any injuries sustained, medical treatment given)

SECTION 6 — DAMAGE ASSESSMENT
(Any damage to vessel, equipment, property)

SECTION 7 — IMMEDIATE ACTIONS TAKEN
(What was done immediately to address the situation)

SECTION 8 — CONTRIBUTING FACTORS
(Weather, mechanical, human factors — be objective)

SECTION 9 — PREVENTIVE MEASURES
(What should be done to prevent recurrence)

SECTION 10 — REPORTING & NOTIFICATIONS
(Who was notified, when, and any regulatory requirements)

SECTION 11 — DECLARATION
Signed: ____________________
Position: Captain
Date: ${form.date}

=== INCIDENT INFORMATION PROVIDED ===
Incident Type: ${form.incidentType}
Date: ${form.date}
Time: ${form.time||"Not recorded"}
Location: ${form.location||"Not recorded"}
Crew Onboard: ${crewOnboard}
Description: ${form.description}
Injuries: ${form.injuries}
Damage: ${form.damage}
Witnesses: ${form.witnesses||"None recorded"}
Immediate Action Taken: ${form.immediateAction||"See section 7"}
Reported To: ${form.reportedTo||"To be confirmed"}

Write the complete formal incident report now:`;
  }

  async function generate() {
    if(!form.incidentType||!form.description.trim()) return;
    setLoading(true);
    setView("report");
    logA("Incident Report Requested", `${form.incidentType} — ${form.date}`);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1500,
          messages:[{role:"user", content:buildPrompt()}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"Error generating report.";
      const entry = {
        id:Date.now(),
        ref:`IR-${Date.now().toString().slice(-6)}`,
        type:form.incidentType,
        date:form.date,
        location:form.location,
        report:text,
        generatedAt:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
        form:{...form},
      };
      setReport(entry);
      setSaved(p=>[entry,...p].slice(0,10));
      logA("Incident Report Generated", `${form.incidentType} — Ref: ${entry.ref}`);
    } catch(e) {
      setReport({report:"Connection error. Please try again.", type:form.incidentType, date:form.date, ref:"—"});
    }
    setLoading(false);
  }

  function formatReport(text) {
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:8}}/>;
      const isSectionHeader = /^SECTION \d+/i.test(line.trim())||/^INCIDENT REPORT/i.test(line.trim());
      const isFieldLabel    = /^(Report Reference|Date of Report|Signed|Position|Date):/.test(line.trim());
      const isBullet        = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      if(isSectionHeader) return <div key={i} style={{fontSize:11,fontWeight:700,color:C.brass,textTransform:"uppercase",letterSpacing:1.2,marginTop:16,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>{line}</div>;
      if(isFieldLabel) {
        const [label,...rest] = line.split(":");
        return <div key={i} style={{fontSize:12,marginBottom:3,display:"flex",gap:6}}>
          <span style={{color:C.muted,flexShrink:0,fontWeight:600}}>{label}:</span>
          <span style={{color:C.white}}>{rest.join(":").trim()}</span>
        </div>;
      }
      if(isBullet) return <div key={i} style={{display:"flex",gap:6,marginBottom:3}}>
        <span style={{color:C.brass,flexShrink:0}}>›</span>
        <span style={{fontSize:13,color:C.text,lineHeight:1.6}}>{line.replace(/^[-•]\s*/,"")}</span>
      </div>;
      return <div key={i} style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:2}}>{line}</div>;
    });
  }

  const F = ({label,children,required}) => <div style={{marginBottom:12}}>
    <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{label}{required&&<span style={{color:C.signal}}> *</span>}</label>
    {children}
  </div>;

  return <div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Incident Report Writer</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>Describe what happened — AI writes a professional report ready to sign and file</div>
    </div>

    {/* Tab bar */}
    <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:16,width:"fit-content"}}>
      {[["form","New Report",""],["report","Report",""],["saved","Saved",""]].map(([id,label,icon])=>(
        <button key={id} onClick={()=>setView(id)} style={{...btn,background:view===id?C.card:"transparent",color:view===id?C.navy:C.muted,padding:"6px 14px",fontSize:12,border:"none",display:"flex",alignItems:"center",gap:5}}>
          <span>{icon}</span>{label}
          {id==="saved"&&saved.length>0&&<span style={{background:C.navyMid,color:C.muted,borderRadius:10,fontSize:9,padding:"1px 5px"}}>{saved.length}</span>}
        </button>
      ))}
    </div>

    {/* FORM */}
    {view==="form"&&<div style={{maxWidth:600}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.signal,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Incident Details</div>

        <F label="Incident Type" required>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {INCIDENT_TYPES.map(t=>(
              <button key={t} onClick={()=>setForm(p=>({...p,incidentType:t}))}
                style={{...btn,background:form.incidentType===t?C.signal+"22":C.navyLight,color:form.incidentType===t?C.signal:C.muted,border:`1px solid ${form.incidentType===t?C.signal+"66":C.border}`,padding:"5px 10px",fontSize:11,transition:"all .12s"}}>
                {t}
              </button>
            ))}
          </div>
        </F>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <F label="Date" required>
            <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{...inp,padding:"8px 10px"}}/>
          </F>
          <F label="Time">
            <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={{...inp,padding:"8px 10px"}}/>
          </F>
        </div>

        <F label="Location / Position">
          <input value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}
            placeholder="e.g. Dubai Marina berth 42, or GPS 25°04'N 55°08'E"
            style={{...inp,padding:"8px 10px"}}/>
        </F>

        <F label="Description of Incident" required>
          <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
            placeholder="Describe what happened in plain language. Include sequence of events, who was involved, what caused it. The AI will turn this into a formal report."
            rows={5} style={{...inp,resize:"vertical",padding:"8px 10px"}}/>
        </F>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Injuries, Damage & Actions</div>

        <F label="Injuries Sustained">
          <input value={form.injuries} onChange={e=>setForm(p=>({...p,injuries:e.target.value}))}
            placeholder="e.g. None, or describe injuries and treatment given"
            style={{...inp,padding:"8px 10px"}}/>
        </F>

        <F label="Damage to Vessel / Equipment">
          <input value={form.damage} onChange={e=>setForm(p=>({...p,damage:e.target.value}))}
            placeholder="e.g. None, or describe damage"
            style={{...inp,padding:"8px 10px"}}/>
        </F>

        <F label="Immediate Action Taken">
          <textarea value={form.immediateAction} onChange={e=>setForm(p=>({...p,immediateAction:e.target.value}))}
            placeholder="e.g. MOB drill initiated, crew mustered, coast guard notified, medical kit deployed"
            rows={3} style={{...inp,resize:"vertical",padding:"8px 10px"}}/>
        </F>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <F label="Witnesses">
            <input value={form.witnesses} onChange={e=>setForm(p=>({...p,witnesses:e.target.value}))}
              placeholder="Names of witnesses" style={{...inp,padding:"8px 10px"}}/>
          </F>
          <F label="Reported To">
            <input value={form.reportedTo} onChange={e=>setForm(p=>({...p,reportedTo:e.target.value}))}
              placeholder="e.g. Management, Coast Guard, Flag State"
              style={{...inp,padding:"8px 10px"}}/>
          </F>
        </div>
      </div>

      {/* Crew onboard auto-fill note */}
      <div style={{background:C.navyLight,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:C.muted}}>
        {"Crew onboard auto-detected: "}<span style={{color:C.text}}>{crewOnboard}</span>
      </div>

      <button onClick={generate} disabled={loading||!form.incidentType||!form.description.trim()}
        style={{...btn,background:form.incidentType&&form.description.trim()&&!loading?C.signal:C.navyLight,color:form.incidentType&&form.description.trim()&&!loading?"white":C.muted,width:"100%",padding:"12px",fontSize:14,fontWeight:700,transition:"all .15s"}}>
        {loading?"Generating Report…":"Generate Incident Report"}
      </button>
    </div>}

    {/* REPORT VIEW */}
    {view==="report"&&<div>
      {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
        <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>AI is writing the incident report…</div>
        <div style={{fontSize:11,color:C.muted}}>Formatting into professional maritime standard</div>
      </div>}

      {!loading&&!report&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
        <div>Fill in the incident details first</div>
        <button onClick={()=>setView("form")} style={{...btn,background:C.signal,color:"white",marginTop:12}}>Back to Form</button>
      </div>}

      {!loading&&report&&<div>
        {/* Report header bar */}
        <div style={{background:C.card,border:`1px solid ${C.signal}44`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",justifyContent:"center"}}><Ico i={AlertTriangle} s={20} c={C.signal}/></div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.text,fontSize:14}}>{report.type}</div>
            <div style={{fontSize:11,color:C.muted}}>{report.ref} · {report.date} · Generated {report.generatedAt}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setView("form")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:11}}>Edit Details</button>
            <button onClick={()=>{
              const el=document.createElement("a");
              const blob=new Blob([report.report],{type:"text/plain"});
              el.href=URL.createObjectURL(blob);
              el.download=`${report.ref}_${report.type.replace(/[^a-z0-9]/gi,"_")}.txt`;
              el.click();
            }} style={{...btn,background:C.brass,color:C.bg,padding:"5px 12px",fontSize:11}}>Download</button>
          </div>
        </div>

        {/* The report */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24}}>
          {formatReport(report.report)}
        </div>

        <div style={{background:C.navyLight,borderRadius:8,padding:"10px 14px",marginTop:10,fontSize:11,color:C.muted}}>
          {"✓ Report saved automatically · Download as .txt file · Sign and file with flag state or insurance as required"}
        </div>
      </div>}
    </div>}

    {/* SAVED REPORTS */}
    {view==="saved"&&<div>
      {saved.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={FolderOpen} s={28} c={C.muted}/></div>No incident reports yet.
      </div>}
      {saved.map(r=>(
        <div key={r.id} onClick={()=>{setReport(r);setView("report");}} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.signal}`,borderRadius:8,padding:"12px 16px",marginBottom:8,cursor:"pointer",transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.signal}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{r.type}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.ref} · {r.date} · {r.location||"Location not recorded"}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>Generated {r.generatedAt}</div>
            </div>
            <span style={{color:C.muted,fontSize:14}}>›</span>
          </div>
        </div>
      ))}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// AI FEATURE #7 — CHARTER HANDOVER BRIEF
// ═══════════════════════════════════════════════════════════════
function AIHandoverModule({tasks, crew, docs, assets, inventory, guests, logbook, role, logAudit}) {
  const [charter, setCharter]   = useState({
    guestName:"", arrivalDate:"", arrivalTime:"", departureDate:"",
    berth:"Dubai Marina", guests:4, occasion:"", specialRequests:"",
    selectedGuests:[],
  });
  const [loading, setLoading]   = useState(false);
  const [brief, setBrief]       = useState(null);
  const [saved, setSaved]       = useState([]);
  const [tab, setTab]           = useState("setup"); // setup | brief | saved
  const logA = (a,d) => logAudit&&logAudit(a,d,"AI Handover Brief");

  const crewOnboard     = crew.filter(c=>c.onboard);
  const overdueAll      = tasks.filter(t=>t.status==="Overdue");
  const criticalAll     = tasks.filter(t=>t.priority==="Critical"&&t.status!=="Done");
  const pendingOwner    = tasks.filter(t=>t.category==="Owner Request"&&t.status!=="Done");
  const lowInv          = (inventory||[]).filter(i=>i.qty<i.minQty&&i.minQty>0);
  const expiredDocs     = docs.filter(d=>d.status==="Expired");
  const assetsDue       = (assets||[]).filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a)));
  const selectedGuestProfiles = guests.filter(g=>charter.selectedGuests.includes(g.id));

  function buildPrompt() {
    const deptStatus = ["Captain","Engineering","Deck","Interior","Galley"].map(dept=>{
      const dt = tasks.filter(t=>t.dept===dept);
      const ov = dt.filter(t=>t.status==="Overdue").length;
      const dn = dt.filter(t=>t.status==="Done").length;
      const pct = dt.length?Math.round((dn/dt.length)*100):100;
      return `${dept}: ${pct}% complete${ov>0?`, ${ov} OVERDUE`:""}`;
    }).join("\n");

    const guestInfo = selectedGuestProfiles.length>0
      ? selectedGuestProfiles.map(g=>`
  - Name: ${g.name} (${g.type})
    Nationality: ${g.nationality||"—"}
    Dietary: ${g.dietary||"No restrictions"}
    Allergies: ${g.allergies||"None"} ${g.allergies&&g.allergies!=="None"?"⚠ CRITICAL":""}
    Drinks: ${g.drinks||"Not specified"}
    Notes: ${g.notes||"None"}`).join("\n")
      : "Guest profiles not selected";

    return `You are the Captain of M/Y Tiberias, a professional luxury superyacht.
Write a comprehensive crew handover brief for the upcoming charter.
This document will be read by all crew members before guest arrival.
Be specific, practical, and professional. Use clear headings.
Flag anything CRITICAL or URGENT in capitals.

Structure the brief with these sections:

1. CHARTER OVERVIEW
2. GUEST PROFILES & KEY REQUIREMENTS
3. VESSEL READINESS STATUS
4. DEPARTMENT BRIEFINGS (Captain / Engineer / Stew / Deckhand / Chef)
5. OUTSTANDING TASKS — MUST BE COMPLETED BEFORE ARRIVAL
6. INVENTORY & PROVISIONING NOTES
7. MAINTENANCE ALERTS
8. DOCUMENT STATUS
9. SCHEDULE & ITINERARY NOTES
10. SPECIAL INSTRUCTIONS & OWNER REQUESTS
11. EMERGENCY CONTACTS & PROCEDURES
12. CAPTAIN'S SIGN-OFF

=== CHARTER DETAILS ===
Lead Guest / Charter Party: ${charter.guestName||"TBC"}
Number of Guests: ${charter.guests}
Occasion: ${charter.occasion||"General charter"}
Arrival: ${charter.arrivalDate} at ${charter.arrivalTime||"TBC"}
Departure: ${charter.departureDate||"TBC"}
Berth: ${charter.berth}
Special Requests: ${charter.specialRequests||"None"}

=== GUEST PROFILES ===
${guestInfo}

=== VESSEL STATUS ===
Department completion:
${deptStatus}

Overdue tasks (${overdueAll.length}):
${overdueAll.slice(0,8).map(t=>`- ${t.title} (${t.dept} — ${t.priority})`).join("\n")||"None"}

Critical open tasks (${criticalAll.length}):
${criticalAll.map(t=>`- ${t.title}`).join("\n")||"None"}

Owner/charter requests pending (${pendingOwner.length}):
${pendingOwner.map(t=>`- ${t.title}: ${t.notes||t.desc}`).join("\n")||"None"}

=== CREW ONBOARD (${crewOnboard.length}) ===
${crewOnboard.map(c=>`- ${c.name} (${c.position})`).join("\n")||"None confirmed"}

=== INVENTORY ALERTS ===
Low/out of stock (${lowInv.length} items):
${lowInv.slice(0,8).map(i=>`- ${i.name}: ${i.qty}/${i.minQty} ${i.unit}${i.qty===0?" — OUT OF STOCK":""}`).join("\n")||"All stock adequate"}

=== MAINTENANCE STATUS ===
Assets requiring attention (${assetsDue.length}):
${assetsDue.map(a=>{const rem=hoursUntilService(a);return `- ${a.name}: ${rem<=0?`OVERDUE by ${Math.abs(rem)}hrs`:`due in ${rem}hrs`}`;}).join("\n")||"All equipment current"}

=== DOCUMENT STATUS ===
Expired documents (${expiredDocs.length}):
${expiredDocs.map(d=>`- ${d.name}`).join("\n")||"None"}

=== LAST LOGBOOK ENTRY ===
${logbook&&logbook[0]?`${logbook[0].date}: ${logbook[0].departure} to ${logbook[0].arrival}. Incidents: ${logbook[0].incidents}`:"No recent entries"}

Write the complete charter handover brief now:`;
  }

  async function generate() {
    if(!charter.arrivalDate) return;
    setLoading(true);
    setTab("brief");
    logA("Handover Brief Requested", `${charter.guestName||"Charter"} — arrival ${charter.arrivalDate}`);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:2000,
          messages:[{role:"user", content:buildPrompt()}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"Error generating brief.";
      const entry = {
        id:Date.now(),
        charter:{...charter},
        brief:text,
        generatedAt:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
        guestName:charter.guestName||"Charter",
        arrivalDate:charter.arrivalDate,
      };
      setBrief(entry);
      setSaved(p=>[entry,...p].slice(0,10));
      logA("Handover Brief Generated", `${charter.guestName||"Charter"} arriving ${charter.arrivalDate}`);
    } catch(e) {
      setBrief({brief:"Connection error. Please try again.", guestName:"Error", arrivalDate:charter.arrivalDate});
    }
    setLoading(false);
  }

  function formatBrief(text) {
    return text.split("\n").map((line,i)=>{
      if(!line.trim()) return <div key={i} style={{height:7}}/>;
      const isMainHeader  = /^\d+\.\s+[A-Z]/.test(line.trim())||/^[A-Z\s&—]{8,}$/.test(line.trim());
      const isSubHeader   = line.trim().endsWith(":") && line.trim().length<60 && line.trim()===line.trim().toUpperCase();
      const isCritical    = /CRITICAL|URGENT|OVERDUE|OUT OF STOCK|EXPIRED/.test(line);
      const isBullet      = line.trimStart().startsWith("-")||line.trimStart().startsWith("•");
      const parts         = line.split(/\*\*(.*?)\*\*/g);
      const content       = parts.map((p,j)=>j%2===1
        ?<strong key={j} style={{color:isCritical?C.signal:C.white,fontWeight:700}}>{p}</strong>
        :<span key={j}>{p}</span>);

      if(isMainHeader) return <div key={i} style={{fontSize:12,fontWeight:800,color:C.brassL,textTransform:"uppercase",letterSpacing:1.2,marginTop:18,marginBottom:6,paddingBottom:5,borderBottom:`2px solid ${C.brass}44`}}>{line}</div>;
      if(isSubHeader)  return <div key={i} style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginTop:10,marginBottom:4}}>{line}</div>;
      if(isBullet)     return <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start",paddingLeft:4}}>
        <span style={{color:isCritical?C.signal:C.brass,flexShrink:0,marginTop:2}}>›</span>
        <span style={{fontSize:13,color:isCritical?C.signal:C.text,lineHeight:1.6,fontWeight:isCritical?600:400}}>{content}</span>
      </div>;
      return <div key={i} style={{fontSize:13,color:isCritical?C.signal:C.text,lineHeight:1.7,marginBottom:2,fontWeight:isCritical?600:400}}>{content}</div>;
    });
  }

  return <div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:18,fontWeight:800,color:C.navy}}>AI Charter Handover Brief</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>One tap — AI reads all vessel data and generates a complete crew briefing document</div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:16,width:"fit-content"}}>
      {[["setup","Setup",""],["brief","Brief",""],["saved","Saved",""]].map(([id,label,icon])=>(
        <button key={id} onClick={()=>setTab(id)} style={{...btn,background:tab===id?C.card:"transparent",color:tab===id?C.navy:C.muted,padding:"6px 14px",fontSize:12,border:"none",display:"flex",alignItems:"center",gap:5}}>
          <span>{icon}</span>{label}
          {id==="saved"&&saved.length>0&&<span style={{background:C.navyMid,color:C.muted,borderRadius:10,fontSize:9,padding:"1px 5px"}}>{saved.length}</span>}
        </button>
      ))}
    </div>

    {/* SETUP */}
    {tab==="setup"&&<div style={{maxWidth:600}}>
      {/* Vessel status snapshot */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {[
          {label:"Overdue Tasks",   val:overdueAll.length,   color:overdueAll.length>0?C.signal:C.greenL},
          {label:"Critical Items",  val:criticalAll.length,  color:criticalAll.length>0?C.signal:C.greenL},
          {label:"Low Stock",       val:lowInv.length,       color:lowInv.length>0?C.amber:C.greenL},
          {label:"Assets Due",      val:assetsDue.length,    color:assetsDue.length>0?C.amber:C.greenL},
          {label:"Expired Docs",    val:expiredDocs.length,  color:expiredDocs.length>0?C.signal:C.greenL},
        ].map(s=>(
          <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",flex:1,minWidth:90,textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:800,color:s.color,fontFamily:"monospace"}}>{s.val}</div>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.brassL,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Charter Details</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <div style={{marginBottom:12,gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Lead Guest / Charter Name</label>
            <input value={charter.guestName} onChange={e=>setCharter(p=>({...p,guestName:e.target.value}))}
              placeholder="e.g. Ahmed Al Maktoum / Smith Party" style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Arrival Date <span style={{color:C.signal}}>*</span></label>
            <input type="date" value={charter.arrivalDate} onChange={e=>setCharter(p=>({...p,arrivalDate:e.target.value}))} style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Arrival Time</label>
            <input type="time" value={charter.arrivalTime} onChange={e=>setCharter(p=>({...p,arrivalTime:e.target.value}))} style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Departure Date</label>
            <input type="date" value={charter.departureDate} onChange={e=>setCharter(p=>({...p,departureDate:e.target.value}))} style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Number of Guests</label>
            <input type="number" min={1} max={20} value={charter.guests} onChange={e=>setCharter(p=>({...p,guests:Number(e.target.value)}))} style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12,gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Berth / Location</label>
            <input value={charter.berth} onChange={e=>setCharter(p=>({...p,berth:e.target.value}))}
              placeholder="e.g. Dubai Marina Berth 42" style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:12,gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Occasion / Charter Type</label>
            <input value={charter.occasion} onChange={e=>setCharter(p=>({...p,occasion:e.target.value}))}
              placeholder="e.g. Family holiday, corporate event, birthday" style={{...inp,padding:"8px 10px"}}/>
          </div>
          <div style={{marginBottom:4,gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Special Requests & Important Notes</label>
            <textarea value={charter.specialRequests} onChange={e=>setCharter(p=>({...p,specialRequests:e.target.value}))}
              placeholder="e.g. Champagne on arrival, formal dinner night 2, jet ski ready from day 1, no fish for owner"
              rows={3} style={{...inp,resize:"vertical",padding:"8px 10px"}}/>
          </div>
        </div>
      </div>

      {/* Guest profile selector */}
      {guests.length>0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Include Guest Profiles</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {guests.map(g=>{
            const sel = charter.selectedGuests.includes(g.id);
            const hasAllergy = g.allergies&&g.allergies!=="None";
            return <div key={g.id} onClick={()=>setCharter(p=>({...p,selectedGuests:sel?p.selectedGuests.filter(x=>x!==g.id):[...p.selectedGuests,g.id]}))}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?C.navyMid:C.navyLight,border:`1px solid ${sel?C.brassL+"66":C.border}`,borderRadius:8,cursor:"pointer",transition:"all .12s"}}>
              <input type="checkbox" checked={sel} readOnly style={{cursor:"pointer",flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{g.name}</div>
                <div style={{fontSize:11,color:C.muted}}>{g.type}{g.dietary&&g.dietary!=="No restrictions"?` · ${g.dietary}`:""}</div>
              </div>
              {hasAllergy&&<Pill label={`⚠ ${g.allergies}`} bg={C.signal+"22"} color={C.signal} small/>}
            </div>;
          })}
        </div>
      </div>}

      <button onClick={generate} disabled={loading||!charter.arrivalDate}
        style={{...btn,background:charter.arrivalDate&&!loading?C.brassL:C.navyLight,color:charter.arrivalDate&&!loading?C.bg:C.muted,width:"100%",padding:"12px",fontSize:14,fontWeight:700,transition:"all .15s"}}>
        {loading?"Generating Brief…":"Generate Handover Brief"}
      </button>
    </div>}

    {/* BRIEF VIEW */}
    {tab==="brief"&&<div>
      {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:36,textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Ico i={ClipboardList} s={32} c={C.muted}/></div>
        <div style={{fontSize:14,color:C.text,fontWeight:700,marginBottom:6}}>AI is writing the handover brief…</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Reading tasks, crew, inventory, maintenance and guest profiles</div>
        <div style={{background:C.navyLight,borderRadius:4,height:5,maxWidth:260,margin:"0 auto",overflow:"hidden"}}>
          <div style={{height:"100%",background:C.brassL,width:"70%",borderRadius:4}}/>
        </div>
      </div>}

      {!loading&&!brief&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={ClipboardList} s={28} c={C.muted}/></div>
        <div>Set up the charter details first</div>
        <button onClick={()=>setTab("setup")} style={{...btn,background:C.brass,color:C.bg,marginTop:12}}>Go to Setup</button>
      </div>}

      {!loading&&brief&&<div>
        {/* Brief header */}
        <div style={{background:C.card,border:`1px solid ${C.brassL}44`,borderRadius:10,padding:"14px 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.navy}}>Charter Handover Brief</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                {brief.guestName} · Arrival: {brief.arrivalDate} · Generated {brief.generatedAt}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setTab("setup")} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 12px",fontSize:11}}>Edit</button>
              <button onClick={()=>{
                const el=document.createElement("a");
                const blob=new Blob([brief.brief],{type:"text/plain"});
                el.href=URL.createObjectURL(blob);
                el.download=`Handover_Brief_${brief.arrivalDate}_${(brief.guestName||"Charter").replace(/\s+/g,"_")}.txt`;
                el.click();
              }} style={{...btn,background:C.brass,color:C.bg,padding:"5px 14px",fontSize:11}}>Download</button>
            </div>
          </div>
        </div>

        {/* Brief content */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24}}>
          {formatBrief(brief.brief)}
        </div>

        <div style={{background:C.navyLight,borderRadius:8,padding:"10px 14px",marginTop:10,fontSize:11,color:C.muted}}>
          {"✓ Brief auto-saved · Download as .txt to share with crew · Print and post in crew mess"}
        </div>
      </div>}
    </div>}

    {/* SAVED */}
    {tab==="saved"&&<div>
      {saved.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={FolderOpen} s={28} c={C.muted}/></div>No handover briefs saved yet.
      </div>}
      {saved.map(s=>(
        <div key={s.id} onClick={()=>{setBrief(s);setTab("brief");}} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.brassL}`,borderRadius:8,padding:"12px 16px",marginBottom:8,cursor:"pointer",transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.brassL}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,color:C.text,fontSize:13}}>{s.guestName}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Arrival: {s.arrivalDate} · {s.charter.guests} guests{s.charter.occasion?` · ${s.charter.occasion}`:""}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>Generated {s.generatedAt}</div>
            </div>
            <span style={{color:C.muted,fontSize:14}}>›</span>
          </div>
        </div>
      ))}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// WEATHER MODULE — Marine Weather System (Clean Build)
// API: Open-Meteo (free, no key, global coverage)
// ═══════════════════════════════════════════════════════════════

const MARINAS = [
  {name:"Dubai Marina",     lat:25.0805, lon:55.1403},
  {name:"Abu Dhabi — Yas",  lat:24.4672, lon:54.6031},
  {name:"Palm Jumeirah",    lat:25.1124, lon:55.1390},
  {name:"Mina Rashid",      lat:25.2285, lon:55.2832},
];

const SEA_STATES = [
  {max:0.1,  label:"Glassy",      color:"#25b085"},
  {max:0.5,  label:"Calm",        color:"#25b085"},
  {max:1.25, label:"Slight",      color:"#e0b84a"},
  {max:2.5,  label:"Moderate",    color:"#e0b84a"},
  {max:4.0,  label:"Rough",       color:"#d97b2a"},
  {max:6.0,  label:"Very Rough",  color:"#cf4338"},
  {max:9.0,  label:"High",        color:"#cf4338"},
  {max:14.0, label:"Very High",   color:"#cf4338"},
  {max:999,  label:"Phenomenal",  color:"#8b0000"},
];

function getSeaState(h) { return SEA_STATES.find(s=>h<=s.max)||SEA_STATES[SEA_STATES.length-1]; }
function ms2kt(ms)       { return Math.round(ms*1.94384*10)/10; }
function windDir(deg)    { return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(deg/22.5)%16]; }

function bft(kt) {
  if(kt<1)  return {n:0,d:"Calm"};
  if(kt<4)  return {n:1,d:"Light Air"};
  if(kt<7)  return {n:2,d:"Light Breeze"};
  if(kt<11) return {n:3,d:"Gentle Breeze"};
  if(kt<17) return {n:4,d:"Moderate Breeze"};
  if(kt<22) return {n:5,d:"Fresh Breeze"};
  if(kt<28) return {n:6,d:"Strong Breeze"};
  if(kt<34) return {n:7,d:"Near Gale"};
  if(kt<41) return {n:8,d:"Gale"};
  return     {n:9,d:"Strong Gale+"};
}

function condColor(windKt, waveM) {
  if(windKt>34||waveM>4)   return C.signal;
  if(windKt>22||waveM>2.5) return C.amber;
  return C.greenL;
}

async function fetchAIWeatherBriefing(wxData) {
  const {windKt, gustKt, windDeg, waveH, swellH, tempC, vis, uvIdx, pres, hum, seaLabel, bftLabel, locationName, forecast} = wxData;
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const wDir = windDeg!=null ? dirs[Math.round(windDeg/22.5)%16] : "—";

  const forecastSummary = (forecast||[]).slice(1,4).map(d=>`${d.label}: ${d.wKt!=null?d.wKt+"kt wind":"—"}, ${d.wvH!=null?d.wvH.toFixed(1)+"m waves":"—"}, ${d.tMax!=null?d.tMax+"°C":""}`).join(" | ");

  const prompt = `You are a marine weather assistant for yacht operations. Provide a concise operational briefing for the captain.

CURRENT CONDITIONS at ${locationName}:
- Wind: ${windKt!=null?windKt:"—"}kt ${wDir}, gusts ${gustKt!=null?gustKt:"—"}kt
- Sea state: ${seaLabel||"—"} (${bftLabel||"—"})
- Waves: ${waveH!=null?waveH.toFixed(1)+"m":"—"}, Swell: ${swellH!=null?swellH.toFixed(1)+"m":"—"}
- Temperature: ${tempC!=null?tempC+"°C":"—"}, Visibility: ${vis!=null?vis+"km":"—"}
- UV Index: ${uvIdx!=null?uvIdx:"—"}, Pressure: ${pres!=null?pres+"hPa":"—"}, Humidity: ${hum!=null?hum+"%":"—"}

NEXT 3 DAYS: ${forecastSummary||"Not available"}

Respond with ONLY a JSON object — no markdown, no extra text:
{
  "status": "green" | "amber" | "red",
  "headline": "One short sentence — overall verdict for today",
  "insights": [
    {"icon": "emoji", "text": "Short operational note", "level": "green"|"amber"|"red"},
    {"icon": "emoji", "text": "Short operational note", "level": "green"|"amber"|"red"},
    {"icon": "emoji", "text": "Short operational note", "level": "green"|"amber"|"red"}
  ],
  "outlook": "One sentence about the next 3 days"
}

Rules:
- insights: exactly 3, each max 10 words, practical crew/captain language
- Cover: guest safety, deck ops, tender, stabilisers, navigation — as relevant
- Be direct. No fluff.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",
      max_tokens:400,
      messages:[{role:"user",content:prompt}]
    })
  });
  const data = await res.json();
  const raw = data.content?.[0]?.text||"{}";
  const clean = raw.replace(/```json|```/g,"").trim();
  return JSON.parse(clean);
}

// ── API Fetchers ─────────────────────────────────────────────
async function fetchWeatherFull(lat, lon) {
  const [atmo, marine] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      +`&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,surface_pressure,cloud_cover,visibility,uv_index,is_day`
      +`&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunrise,sunset,uv_index_max,precipitation_probability_max`
      +`&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m`
      +`&wind_speed_unit=ms&forecast_days=7&timezone=auto&forecast_hours=24`).then(r=>r.json()),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}`
      +`&current=wave_height,wave_direction,swell_wave_height,swell_wave_direction,swell_wave_period`
      +`&daily=wave_height_max,swell_wave_height_max`
      +`&forecast_days=7&timezone=auto`).then(r=>r.json()).catch(()=>null),
  ]);
  return {atmo, marine};
}

// ── Sub-components ───────────────────────────────────────────
function WxTile({label, value, unit, icon, color, sub}) {
  return <div style={{background:C.navyLight,borderRadius:9,padding:"11px 13px",flex:1,minWidth:95}}>
    {icon&&<div style={{fontSize:17,marginBottom:3}}>{icon}</div>}
    <div style={{fontSize:20,fontWeight:800,color:color||C.white,fontFamily:"monospace",lineHeight:1}}>
      {value!=null?value:<span style={{color:C.muted,fontSize:13}}>—</span>}
      {unit&&value!=null&&<span style={{fontSize:11,color:C.muted,fontWeight:400}}> {unit}</span>}
    </div>
    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginTop:3}}>{label}</div>
    {sub&&<div style={{fontSize:10,color:C.muted,marginTop:1}}>{sub}</div>}
  </div>;
}

function SectionLabel({children}) {
  return <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:7,marginTop:14}}>{children}</div>;
}

function WindArrow({deg, size=28}) {
  return <div style={{width:size,height:size,position:"relative",flexShrink:0}}>
    <div style={{width:2,height:size*0.65,background:C.brassL,borderRadius:2,
      transformOrigin:"50% 100%",transform:`rotate(${deg}deg)`,
      position:"absolute",bottom:"50%",left:"50%",marginLeft:-1}}/>
    <div style={{width:0,height:0,
      borderLeft:`${size*0.13}px solid transparent`,
      borderRight:`${size*0.13}px solid transparent`,
      borderBottom:`${size*0.22}px solid ${C.brassL}`,
      transformOrigin:"50% 100%",
      transform:`rotate(${deg}deg) translateX(-50%)`,
      position:"absolute",top:"12%",left:"50%"}}/>
  </div>;
}

// ── WEATHER AI CHAT ──────────────────────────────────────────
function AIWeatherChat({wx, loc}) {
  const [messages, setMessages] = useState([
    {role:"assistant", text:"I'm your marine weather and voyage planning assistant. Ask me about current conditions, the forecast, or plan a voyage — just tell me your route and vessel speed."}
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  function buildContext() {
    if(!wx?.atmo) return "No live weather data loaded yet.";
    const cur   = wx.atmo.current;
    const daily = wx.atmo.daily;
    const mcur  = wx.marine?.current;
    const mdaily= wx.marine?.daily;
    const dirs  = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    const wKt   = cur ? Math.round(ms2kt(cur.wind_speed_10m)) : null;
    const wDeg  = cur?.wind_direction_10m;
    const gKt   = cur ? Math.round(ms2kt(cur.wind_gusts_10m)) : null;
    const temp  = cur ? Math.round(cur.temperature_2m) : null;
    const vis   = cur ? Math.round((cur.visibility||0)/1000) : null;
    const pres  = cur ? Math.round(cur.surface_pressure) : null;
    const wvH   = mcur?.wave_height;
    const swH   = mcur?.swell_wave_height;
    const swDir = mcur?.swell_wave_direction;
    const swPer = mcur?.swell_wave_period;
    const sea   = wvH!=null ? getSeaState(wvH) : null;

    const forecastLines = (daily?.time||[]).map((t,i)=>{
      const wk = daily.wind_speed_10m_max?.[i]!=null ? Math.round(ms2kt(daily.wind_speed_10m_max[i])) : null;
      const gk = daily.wind_gusts_10m_max?.[i]!=null ? Math.round(ms2kt(daily.wind_gusts_10m_max[i])) : null;
      const wd = daily.wind_direction_10m_dominant?.[i];
      const wv = mdaily?.wave_height_max?.[i];
      const tx = daily.temperature_2m_max?.[i]!=null ? Math.round(daily.temperature_2m_max[i]) : null;
      const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const day = i===0?"Today":DAYS[new Date(t+"T00:00:00").getDay()];
      return `${day} (${t}): Wind ${wk!=null?wk+"kt":"—"} ${wd!=null?dirs[Math.round(wd/22.5)%16]:""} G${gk!=null?gk:"—"}kt, Waves ${wv!=null?wv.toFixed(1)+"m":"—"}, Temp ${tx!=null?tx+"°C":"—"}`;
    }).join("\n");

    return `LOCATION: ${loc?.name||"Unknown"} (${loc?.lat?.toFixed(4)||"?"}, ${loc?.lon?.toFixed(4)||"?"})

CURRENT CONDITIONS:
- Wind: ${wKt!=null?wKt:"—"}kt ${wDeg!=null?dirs[Math.round(wDeg/22.5)%16]:""}, Gusts: ${gKt!=null?gKt:"—"}kt
- Waves: ${wvH!=null?wvH.toFixed(1)+"m":"—"}, Sea State: ${sea?.label||"—"}
- Swell: ${swH!=null?swH.toFixed(1)+"m":"—"} ${swDir!=null?dirs[Math.round(swDir/22.5)%16]:""} @ ${swPer!=null?Math.round(swPer)+"s":"—"}
- Temperature: ${temp!=null?temp+"°C":"—"}, Visibility: ${vis!=null?vis+"km":"—"}, Pressure: ${pres!=null?pres+"hPa":"—"}

7-DAY FORECAST:
${forecastLines}`;
  }

  async function send() {
    const text = input.trim();
    if(!text||loading) return;
    const userMsg = {role:"user", text};
    setMessages(p=>[...p, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg].map(m=>({
      role: m.role==="assistant"?"assistant":"user",
      content: m.text
    }));

    const systemPrompt = `You are a professional marine weather and voyage planning assistant for yacht operations.

You have access to live weather data for the vessel's current location:

${buildContext()}

Your job:
1. Answer weather questions using the live data above
2. Help plan voyages — when the captain asks about sailing from A to B:
   - Ask for vessel speed (knots) if not provided
   - Calculate estimated voyage duration based on approximate distance
   - Analyse the 7-day forecast windows
   - Recommend the best departure window considering wind, swell, and sea state
   - Give a clear GO / CAUTION / NO-GO recommendation per day
   - Factor in swell direction (beam vs head vs following sea)
3. Be concise and practical — captain's language
4. Use nautical terminology naturally
5. Always consider: wind speed, gusts, wave height, swell period, visibility

Key UAE/Gulf distances for reference:
- Dubai Marina to Abu Dhabi (Yas/Mina Zayed): ~120nm
- Dubai to Sir Bu Nair Island: ~80nm
- Dubai to Musandam: ~85nm
- Dubai to Muscat: ~200nm
- Dubai to Khasab: ~90nm

Keep responses under 300 words. Use bullet points for forecasts.`;

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:600,
          system: systemPrompt,
          messages: history,
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Unable to get a response.";
      setMessages(p=>[...p,{role:"assistant",text:reply}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"assistant",text:"Connection error. Check your network."}]);
    }
    setLoading(false);
  }

  const suggestions = [
    "How are conditions right now?",
    "Best window this week?",
    "Planning Dubai to Abu Dhabi — when should we go?",
    "Is it safe for guests on deck today?",
    "Swell forecast for the next 3 days?",
  ];

  return <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:400}}>
    {/* Messages */}
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
      {messages.map((m,i)=>(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
          <div style={{
            maxWidth:"88%",
            background: m.role==="user" ? C.brass+"22" : C.navyLight,
            border:`1px solid ${m.role==="user"?C.brass+"44":C.border}`,
            borderRadius: m.role==="user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
            padding:"9px 12px",fontSize:12,color:C.text,lineHeight:1.6,
            whiteSpace:"pre-wrap"
          }}>{m.text}</div>
        </div>
      ))}
      {loading&&<div style={{display:"flex",alignItems:"center",gap:6,color:C.muted,fontSize:12,padding:"4px 0"}}>
        <span style={{display:"inline-flex",animation:"spin 1s linear infinite"}}><Ico i={RefreshCw} s={13} c={C.muted}/></span> Analysing weather data…
      </div>}
      <div ref={bottomRef}/>
    </div>

    {/* Suggestions — only show at start */}
    {messages.length<=1&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
      {suggestions.map((s,i)=>(
        <button key={i} onClick={()=>{setInput(s);}} style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:10,borderRadius:20}}>
          {s}
        </button>
      ))}
    </div>}

    {/* Input */}
    <div style={{display:"flex",gap:7,borderTop:`1px solid ${C.border}`,paddingTop:10,flexShrink:0}}>
      <input value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
        placeholder="Ask about weather or plan a voyage…"
        style={{...inp,flex:1,padding:"8px 12px",fontSize:12}}/>
      <button onClick={send} disabled={loading||!input.trim()}
        style={{...btn,background:C.brass,color:C.bg,padding:"8px 14px",fontSize:12,opacity:input.trim()?1:0.5}}>
        Send
      </button>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// CREW LEAVE MANAGEMENT — INTERNAL ONLY. Never exposed to agents.
// ═══════════════════════════════════════════════════════════════

// Map USERS names → crew role keys (for "own request" filtering)
const USER_ROLE_MAP = {
  captain:"captain", management:"management", engineer:"engineer",
  stew:"stew", deckhand:"deckhand", chef:"chef",
};

const INIT_LEAVE = [
  { id:"lv1", crewRole:"stew",     crewName:"Stew",           type:"annual",    start:d(14),  end:d(21),  notes:"Annual leave — summer rotation.",              status:"pending",  submittedAt:"23/06/2026, 09:00", decidedAt:null,  decisionNote:"" },
  { id:"lv2", crewRole:"engineer", crewName:"Chief Engineer",  type:"rotation",  start:d(30),  end:d(44),  notes:"Scheduled rotation. Replacement confirmed.",    status:"approved", submittedAt:"20/06/2026, 14:30", decidedAt:"22/06/2026, 10:00", decisionNote:"Approved. Relief engineer booked." },
  { id:"lv3", crewRole:"deckhand", crewName:"Deckhand",        type:"timeoff",   start:d(5),   end:d(6),   notes:"Family event — 2 days.",                        status:"approved", submittedAt:"19/06/2026, 11:00", decidedAt:"21/06/2026, 08:00", decisionNote:"Approved. Confirm cover with Captain." },
  { id:"lv4", crewRole:"chef",     crewName:"Chef",            type:"annual",    start:d(60),  end:d(74),  notes:"Annual leave. Flights booked.",                 status:"pending",  submittedAt:"23/06/2026, 08:00", decidedAt:null,  decisionNote:"" },
  { id:"lv5", crewRole:"stew",     crewName:"Stew",            type:"sick",      start:d(-3),  end:d(-1),  notes:"Unwell — notified Captain same day.",           status:"approved", submittedAt:"18/06/2026, 07:30", decidedAt:"18/06/2026, 07:45", decisionNote:"Get well soon. Covered internally." },
  { id:"lv6", crewRole:"engineer", crewName:"Chief Engineer",  type:"timeoff",   start:d(10),  end:d(10),  notes:"Medical appointment — half day.",               status:"pending",  submittedAt:"23/06/2026, 10:00", decidedAt:null,  decisionNote:"" },
];

function LeaveModule({ leaveRequests, setLeaveRequests, role, crew, logAudit }) {
  const logL = (a, d) => logAudit && logAudit(a, d, "Leave");

  // ── Access control ────────────────────────────────────────
  // HARD BLOCK: agents must never reach this component (enforced at routing too)
  if(role === "agent") return <AccessDenied/>;

  const isAdmin    = ["captain","management"].includes(role);
  const isOwner    = role === "owner";
  const isReadOnly = isOwner;

  // Crew see only their own requests; captain/management/owner see all
  const visibleRequests = isAdmin || isOwner
    ? leaveRequests
    : leaveRequests.filter(r => r.crewRole === role);

  // ── State ────────────────────────────────────────────────
  const [showForm,    setShowForm]    = useState(false);
  const [editReq,     setEditReq]     = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [statusFilter,setStatusFilter]= useState("All");
  const [typeFilter,  setTypeFilter]  = useState("All");
  const [crewFilter,  setCrewFilter]  = useState("All");
  const [decisionNote,setDecisionNote]= useState("");
  const [showDecision,setShowDecision]= useState(null); // request id awaiting decision

  const [form, setForm] = useState({
    type:"annual", start:TODAY, end:TODAY, notes:"",
  });
  const [alterationOf, setAlterationOf] = useState(null); // id of approved leave being altered

  // ── Derived crew name from role ───────────────────────────
  const myCrewName = crew?.find(c => c.role === role)?.name || role;

  // ── Filters ──────────────────────────────────────────────
  const filtered = visibleRequests.filter(r => {
    if(statusFilter !== "All" && r.status !== statusFilter) return false;
    if(typeFilter   !== "All" && r.type   !== typeFilter)   return false;
    if(isAdmin && crewFilter !== "All" && r.crewRole !== crewFilter) return false;
    return true;
  });

  const pending  = visibleRequests.filter(r => r.status === "pending");
  const upcoming = visibleRequests.filter(r => r.status === "approved" && r.start >= TODAY);

  // ── Submit / edit ────────────────────────────────────────
  function openNew() {
    setEditReq(null);
    setForm({ type:"annual", start:TODAY, end:TODAY, notes:"" });
    setShowForm(true);
  }
  function openEdit(req) {
    setEditReq(req);
    setForm({ type:req.type, start:req.start, end:req.end, notes:req.notes });
    setShowForm(true);
  }
  function save() {
    if(!form.start || !form.end || form.end < form.start) return;
    const lt = LEAVE_TYPES.find(t => t.id === form.type);
    if(editReq) {
      // Captain/admin direct edit — any status
      setLeaveRequests(p => p.map(r => r.id === editReq.id
        ? { ...r, ...form, updatedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}) }
        : r));
      logL("Leave Edited", `${myCrewName} — ${lt?.label} ${form.start}→${form.end}`);
    } else if(alterationOf) {
      // Crew alteration request — new pending request linked to approved leave
      const original = leaveRequests.find(r => r.id === alterationOf);
      const req = {
        id:           `lv_${Date.now()}`,
        crewRole:     role,
        crewName:     myCrewName,
        type:         form.type,
        start:        form.start,
        end:          form.end,
        notes:        form.notes,
        status:       "pending",
        isAlteration: true,
        alterationOf: alterationOf,
        originalDates: original ? `${original.start} → ${original.end}` : "",
        submittedAt:  new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
        decidedAt:    null,
        decisionNote: "",
      };
      setLeaveRequests(p => [req, ...p]);
      logL("Alteration Requested", `${myCrewName} — ${lt?.label} alteration: ${form.start}→${form.end}`);
    } else {
      const req = {
        id:          `lv_${Date.now()}`,
        crewRole:    role,
        crewName:    myCrewName,
        type:        form.type,
        start:       form.start,
        end:         form.end,
        notes:       form.notes,
        status:      "pending",
        submittedAt: new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
        decidedAt:   null,
        decisionNote:"",
      };
      setLeaveRequests(p => [req, ...p]);
      logL("Leave Submitted", `${myCrewName} — ${lt?.label} ${form.start}→${form.end}`);
    }
    setShowForm(false);
    setAlterationOf(null);
  }
  function cancelRequest(id) {
    setLeaveRequests(p => p.map(r => r.id === id ? { ...r, status:"cancelled" } : r));
    logL("Leave Cancelled", `Request ${id} cancelled by ${myCrewName}`);
    if(selected?.id === id) setSelected(null);
  }

  // ── Approve / Decline ────────────────────────────────────
  function decide(id, decision) {
    const req = leaveRequests.find(r => r.id === id);
    if(!req) return;
    setLeaveRequests(p => p.map(r => r.id === id ? {
      ...r,
      status:      decision,
      decidedAt:   new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      decisionNote: decisionNote.trim(),
    } : r));
    const lt = LEAVE_TYPES.find(t => t.id === req.type);
    logL(`Leave ${decision.charAt(0).toUpperCase()+decision.slice(1)}`,
      `${req.crewName} — ${lt?.label} ${req.start}→${req.end}`);
    setShowDecision(null);
    setDecisionNote("");
    // Update selected if open
    setSelected(p => p?.id === id ? { ...p, status:decision, decisionNote:decisionNote.trim() } : p);
  }

  // ── Duration helper ──────────────────────────────────────
  function nights(start, end) {
    const d = Math.round((new Date(end) - new Date(start)) / 86400000);
    return d <= 0 ? "1 day" : `${d+1} day${d+1!==1?"s":""}`;
  }

  const leaveTypeInfo = t => LEAVE_TYPES.find(x => x.id === t) || { label:t, IconC:Calendar, color:C.muted };

  // ── Status badge ─────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const s = LEAVE_STATUS[status] || LEAVE_STATUS.pending;
    return <span style={{fontSize:9,fontWeight:700,background:s.bg,color:s.color,
      padding:"2px 8px",borderRadius:8,textTransform:"uppercase",letterSpacing:.7}}>
      {s.label}
    </span>;
  };

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16,gap:8,flexWrap:"wrap"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:18,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}><Ico i={Umbrella} s={18} c={C.navy}/>{"Crew Leave"}</div>
          <span style={{fontSize:9,background:"#cf433822",color:C.signal,border:"1px solid #cf433844",
            padding:"2px 8px",borderRadius:6,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>
            {"Internal Only"}
          </span>
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:3}}>
          {isAdmin ? "Manage crew leave, rotations and time off requests"
           : isOwner ? "View crew leave schedule"
           : "Submit and manage your leave requests"}
        </div>
      </div>
      {!isReadOnly && <button onClick={openNew}
        style={{...btn,background:C.brass,color:C.bg,padding:"9px 18px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
        + Request Leave
      </button>}
    </div>

    {/* Summary cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:16}}>
      {[
        { label:"Pending",   value:pending.length,  color:C.amber,  IconC:Clock },
        { label:"Upcoming",  value:upcoming.length, color:C.green,  IconC:CheckCircle },
        { label:isAdmin?"Total Requests":"My Requests", value:visibleRequests.length, color:C.blue, IconC:ClipboardList },
        ...(isAdmin?[{ label:"Crew on Leave", value:visibleRequests.filter(r=>r.status==="approved"&&r.start<=TODAY&&r.end>=TODAY).length, color:C.purple, IconC:Umbrella }]:[]),
      ].map(s=>(
        <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{marginBottom:6}}><Ico i={s.IconC} s={20} c={s.color}/></div>
          <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.7}}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Filters */}
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"5px 10px",fontSize:11}}>
        <option value="All">All Statuses</option>
        {Object.entries(LEAVE_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
      </select>
      <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"5px 10px",fontSize:11}}>
        <option value="All">All Types</option>
        {LEAVE_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      {isAdmin&&<select value={crewFilter} onChange={e=>setCrewFilter(e.target.value)}
        style={{...inp,width:"auto",padding:"5px 10px",fontSize:11}}>
        <option value="All">All Crew</option>
        {["captain","engineer","stew","deckhand","chef"].map(r=>(
          <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
        ))}
      </select>}
    </div>

    {/* Pending approvals banner — admin only */}
    {isAdmin && pending.length > 0 && <div style={{background:C.amber+"15",border:`1px solid ${C.amber}44`,
      borderRadius:9,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <Ico i={Clock} s={16} c={C.amber}/>
      <div style={{flex:1}}>
        <span style={{fontSize:12,fontWeight:700,color:C.amber}}>{pending.length} leave request{pending.length!==1?"s":""} awaiting decision</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:8}}>Review and approve or decline below.</span>
      </div>
    </div>}

    {/* Request list */}
    {filtered.length === 0
      ? <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"32px 20px",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Umbrella} s={30} c={C.muted}/></div>
          <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:6}}>No leave requests</div>
          <div style={{fontSize:11,color:C.muted}}>
            {!isReadOnly?"Submit a request using the button above.":"No requests to display."}
          </div>
        </div>
      : filtered.map(req => {
        const lt     = leaveTypeInfo(req.type);
        const ls     = LEAVE_STATUS[req.status] || LEAVE_STATUS.pending;
        const isOpen = selected?.id === req.id;
        const canAct = !isReadOnly && (isAdmin || (req.crewRole === role && req.status === "pending"));
        const isPast = req.end < TODAY;
        return <div key={req.id} style={{background:C.card,border:`1px solid ${isOpen?lt.color+"66":C.border}`,
          borderLeft:`3px solid ${lt.color}`,borderRadius:10,marginBottom:8,overflow:"hidden"}}>

          {/* Row */}
          <div style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}
            onClick={()=>setSelected(isOpen?null:req)}>
            <div style={{width:36,height:36,borderRadius:9,background:lt.color+"22",border:`1px solid ${lt.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico i={lt.IconC||Calendar} s={18} c={lt.color}/></div>
            <div style={{flex:1,minWidth:160}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,color:lt.color}}>{lt.label}</span>
                {isAdmin&&<span style={{fontSize:11,color:C.muted}}>· {req.crewName}</span>}
                {isPast&&<span style={{fontSize:9,color:C.muted,background:C.navyLight,padding:"1px 6px",borderRadius:5}}>Past</span>}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                {req.start === req.end ? req.start : `${req.start} → ${req.end}`}
                <span style={{marginLeft:6,color:C.text}}>· {nights(req.start, req.end)}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <StatusBadge status={req.status}/>
              <span style={{fontSize:12,color:C.muted}}>{isOpen?"▲":"▼"}</span>
            </div>
          </div>

          {/* Expanded detail */}
          {isOpen&&<div style={{borderTop:`1px solid ${C.border}`,padding:"12px 16px",background:C.navyMid}}>
            {/* Notes */}
            {req.notes&&<div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:10,
              background:C.navyLight,borderRadius:7,padding:"8px 12px"}}>
              <span style={{color:C.muted,fontSize:10}}>Notes: </span>{req.notes}
            </div>}

            {/* Meta */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",marginBottom:10}}>
              {[
                ["Submitted",   req.submittedAt||"—"],
                ["Duration",    nights(req.start, req.end)],
                ...(req.decidedAt ? [["Decision date", req.decidedAt]] : []),
                ...(req.decisionNote ? [["Decision note", req.decisionNote]] : []),
              ].map(([k,v])=>(
                <div key={k} style={{fontSize:11,padding:"3px 0"}}>
                  <span style={{color:C.muted}}>{k}: </span>
                  <span style={{color:C.text,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Admin actions — edit always available, approve/decline for pending */}
            {isAdmin && showDecision !== req.id && showDecision !== req.id+":decline" && (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {req.status==="pending"&&<button onClick={()=>{ setShowDecision(req.id); setDecisionNote(""); }}
                  style={{...btn,background:C.green,color:C.bg,padding:"7px 16px",fontSize:11}}>✓ Approve</button>}
                {req.status==="pending"&&<button onClick={()=>{ setShowDecision(req.id+":decline"); setDecisionNote(""); }}
                  style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"7px 16px",fontSize:11}}>✕ Decline</button>}
                <button onClick={()=>openEdit(req)}
                  style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"7px 14px",fontSize:11}}>Edit</button>
              </div>
            )}

            {/* Decision confirmation inline */}
            {isAdmin && req.status === "pending" && (showDecision===req.id||showDecision===req.id+":decline") && (
              <div style={{background:C.navyLight,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,color:showDecision===req.id?C.green:C.signal,fontWeight:700,marginBottom:6}}>
                  {showDecision===req.id?"Approve this request?":"Decline this request?"}
                </div>
                <textarea value={decisionNote} onChange={e=>setDecisionNote(e.target.value)}
                  placeholder="Decision note (optional)…" rows={2}
                  style={{...inp,width:"100%",padding:"6px 9px",fontSize:11,resize:"vertical",marginBottom:8}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>decide(req.id, showDecision===req.id?"approved":"declined")}
                    style={{...btn,background:showDecision===req.id?C.green:C.signal,color:C.bg,padding:"6px 16px",fontSize:11,fontWeight:700}}>
                    Confirm {showDecision===req.id?"Approval":"Decline"}
                  </button>
                  <button onClick={()=>{setShowDecision(null);setDecisionNote("");}}
                    style={{...btn,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:11}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Crew actions — own requests */}
            {!isAdmin && req.crewRole === role && (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {req.status==="pending"&&<button onClick={()=>openEdit(req)}
                  style={{...btn,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,padding:"7px 14px",fontSize:11}}>
                  {"Edit"}
                </button>}
                {req.status==="approved"&&!isPast&&<button onClick={()=>openAlteration(req)}
                  style={{...btn,background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,padding:"7px 14px",fontSize:11}}>
                  {"Request Alteration"}
                </button>}
                {req.status==="pending"&&<button onClick={()=>cancelRequest(req.id)}
                  style={{...btn,background:C.signal+"22",color:C.signal,border:`1px solid ${C.signal}44`,padding:"7px 14px",fontSize:11}}>
                  {"✕ Cancel"}
                </button>}
              </div>
            )}
            {/* Show alteration badge on approved leave if an alteration is pending */}
            {!isAdmin && req.status==="approved" && leaveRequests.some(r=>r.alterationOf===req.id&&r.status==="pending") && (
              <div style={{marginTop:8,padding:"6px 10px",background:C.amber+"15",border:`1px solid ${C.amber}44`,borderRadius:7,fontSize:11,color:C.amber}}>
                Alteration request pending — awaiting Captain approval
              </div>
            )}
            {isAdmin && req.isAlteration && req.originalDates && (
              <div style={{marginTop:8,padding:"6px 10px",background:C.blue+"15",border:`1px solid ${C.blue}44`,borderRadius:7,fontSize:11,color:C.blue}}>
                Alteration request — original dates: {req.originalDates}
              </div>
            )}
          </div>}
        </div>;
      })
    }

    {/* ── FORM MODAL ── */}
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:700,padding:16,overflowY:"auto"}}
      onClick={()=>setShowForm(false)}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,
        width:460,maxWidth:"96vw",padding:24}} onClick={e=>e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:15,fontWeight:800,color:C.navy}}>
            {editReq?"Edit Leave":alterationOf?"Request Alteration":"Request Leave"}
          </div>
          <button onClick={()=>{setShowForm(false);setAlterationOf(null);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:0}}>×</button>
        </div>

        {/* Leave type */}
        <div style={{marginBottom:14}}>
          <div style={{...lbl}}>Leave Type</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {LEAVE_TYPES.map(t=>(
              <button key={t.id} onClick={()=>setForm(p=>({...p,type:t.id}))}
                style={{...btn,padding:"8px 10px",fontSize:11,textAlign:"left",
                  background:form.type===t.id?`${t.color}22`:C.navyLight,
                  color:form.type===t.id?t.color:C.muted,
                  border:`1px solid ${form.type===t.id?t.color+"66":C.border}`,
                  fontWeight:form.type===t.id?700:400}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <div style={{...lbl}}>Start Date</div>
            <input type="date" value={form.start} onChange={e=>setForm(p=>({...p,start:e.target.value,end:p.end<e.target.value?e.target.value:p.end}))}
              style={{...inp,padding:"7px 10px",fontSize:12}}/>
          </div>
          <div>
            <div style={{...lbl}}>End Date</div>
            <input type="date" value={form.end} min={form.start} onChange={e=>setForm(p=>({...p,end:e.target.value}))}
              style={{...inp,padding:"7px 10px",fontSize:12}}/>
          </div>
        </div>
        {form.start&&form.end&&form.end>=form.start&&(
          <div style={{fontSize:11,color:C.muted,marginTop:-8,marginBottom:10}}>
            Duration: <span style={{color:C.white,fontWeight:600}}>{nights(form.start,form.end)}</span>
          </div>
        )}

        {/* Notes */}
        <div style={{marginBottom:18}}>
          <div style={{...lbl}}>{alterationOf?"Reason for Alteration":"Notes"}
            {!alterationOf&&<span style={{color:C.muted,textTransform:"none",fontSize:9}}> (optional)</span>}
            {alterationOf&&<span style={{color:C.signal,textTransform:"none",fontSize:9}}> *required</span>}
          </div>
          <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
            placeholder={alterationOf?"Explain why you need to change the dates (e.g. flights changed, medical follow-up)…":"Reason, rotation details, contact arrangements…"}
            rows={3} style={{...inp,resize:"vertical",fontSize:12,lineHeight:1.5}}/>
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>{setShowForm(false);setAlterationOf(null);}} style={{...btn,flex:1,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`}}>Cancel</button>
          <button onClick={save} disabled={!form.start||!form.end||form.end<form.start||(!!alterationOf&&!form.notes.trim())}
            style={{...btn,flex:2,background:C.brass,color:C.bg,fontWeight:700,
              opacity:(form.start&&form.end&&form.end>=form.start&&(!alterationOf||form.notes.trim()))?1:.5}}>
            {editReq?"Save Changes":alterationOf?"Submit Alteration Request":"Submit Request"}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

// ── MAIN WEATHER MODULE ──────────────────────────────────────
function WeatherModule({logAudit, setLiveWeather}) {
  const [loc,    setLoc]    = useState(MARINAS[0]);
  const [wx,     setWx]     = useState(null);
  const [loading,setLoading]= useState(false);
  const [error,  setError]  = useState(null);
  const [tab,    setTab]    = useState("current");  // current|forecast|hourly
  const [locMode,setLocMode]= useState("gps");
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLon, setGpsLon] = useState(null);
  const [locating,setLocating]=useState(false);
  const [updated,setUpdated]= useState(null);
  const [customLat,setCLat] = useState("");
  const [customLon,setCLon] = useState("");
  const [aiBriefing, setAiBriefing] = useState(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState(null);
  // Nominatim location search (free, no API key, OpenStreetMap)
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResults,setSearchResults]= useState([]);
  const [searching,    setSearching]    = useState(false);
  const [searchError,  setSearchError]  = useState(null);
  const searchTimer = React.useRef(null);

  async function searchLocation(q) {
    if(!q || q.trim().length < 3) { setSearchResults([]); return; }
    setSearching(true); setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language":"en", "User-Agent":"BridgeYachtApp/1.0" } }
      );
      const data = await res.json();
      setSearchResults(data.map(r=>({
        name: r.display_name.split(",").slice(0,3).join(", "),
        lat:  parseFloat(r.lat),
        lon:  parseFloat(r.lon),
      })));
      if(data.length===0) setSearchError("No locations found — try a different search");
    } catch(e) {
      setSearchError("Search unavailable — check connection");
    }
    setSearching(false);
  }

  function onSearchChange(q) {
    setSearchQuery(q);
    setSearchResults([]);
    clearTimeout(searchTimer.current);
    if(q.trim().length >= 3) {
      searchTimer.current = setTimeout(()=>searchLocation(q), 500);
    }
  }

  function selectSearchResult(r) {
    setLoc(r);
    setSearchQuery(r.name);
    setSearchResults([]);
    load(r.lat, r.lon, r.name);
  }

  async function load(lat, lon, name) {
    setLoading(true); setError(null); setAiBriefing(null); setAiError(null);
    try {
      const data = await fetchWeatherFull(lat, lon);
      setWx({...data, name, lat, lon});
      setUpdated(new Date().toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"}));
      if(logAudit) logAudit("Weather Fetched", `${name}`, "Weather");
      // Publish snapshot for logbook auto-fill
      if(setLiveWeather) setLiveWeather({data, name, lat, lon, fetchedAt: new Date().toISOString()});
      // Auto-trigger AI briefing after weather loads
      loadAIBriefing(data, name);
    } catch(e) {
      setError("Unable to load weather. Check connection.");
    }
    setLoading(false);
  }

  async function loadAIBriefing(data, name) {
    setAiLoading(true); setAiError(null);
    try {
      const cur   = data?.atmo?.current;
      const mcur  = data?.marine?.current;
      const daily = data?.atmo?.daily;
      const mdaily= data?.marine?.daily;
      const DIRS  = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
      const wKt   = cur ? ms2kt(cur.wind_speed_10m) : null;
      const gKt   = cur ? ms2kt(cur.wind_gusts_10m) : null;
      const wDeg  = cur?.wind_direction_10m;
      const wvH   = mcur?.wave_height;
      const swH   = mcur?.swell_wave_height;
      const tempC = cur ? Math.round(cur.temperature_2m) : null;
      const vis   = cur ? Math.round((cur.visibility||0)/1000) : null;
      const uvIdx = cur ? Math.round(cur.uv_index||0) : null;
      const pres  = cur ? Math.round(cur.surface_pressure) : null;
      const hum   = cur?.relative_humidity_2m;
      const sea   = wvH!=null ? getSeaState(wvH) : null;
      const bf    = wKt!=null ? bft(wKt) : null;
      const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const forecast = (daily?.time||[]).map((t,i)=>({
        label: i===0?"Today":DAYS[new Date(t+"T00:00:00").getDay()],
        wKt:   daily.wind_speed_10m_max?.[i]!=null ? ms2kt(daily.wind_speed_10m_max[i]) : null,
        wvH:   mdaily?.wave_height_max?.[i],
        tMax:  daily.temperature_2m_max?.[i]!=null ? Math.round(daily.temperature_2m_max[i]) : null,
      }));
      const result = await fetchAIWeatherBriefing({
        windKt:wKt, gustKt:gKt, windDeg:wDeg, waveH:wvH, swellH:swH,
        tempC, vis, uvIdx, pres, hum,
        seaLabel: sea?.label, bftLabel: bf?`Bft ${bf.n} ${bf.d}`:"",
        locationName: name, forecast,
      });
      setAiBriefing(result);
    } catch(e) {
      setAiError("AI briefing unavailable");
    }
    setAiLoading(false);
  }

  // Auto-load on mount — try GPS first, silently fall back to search if denied
  React.useEffect(()=>{
    if(!navigator.geolocation) return; // no GPS support — stay on search tab
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude:lat,longitude:lon}=pos.coords;
        setGpsLat(lat); setGpsLon(lon);
        setLocating(false);
        // Reverse geocode with Nominatim to get a human-readable name
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          {headers:{"Accept-Language":"en","User-Agent":"BridgeYachtApp/1.0"}})
          .then(r=>r.json())
          .then(d=>{
            const name = d.address
              ? [d.address.marina||d.address.harbour||d.address.suburb||d.address.city||d.address.town||d.address.village||d.address.county, d.address.country].filter(Boolean).join(", ")
              : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
            setLoc({name,lat,lon});
            setSearchQuery(name);
            load(lat,lon,name);
          })
          .catch(()=>{
            const name=`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
            setLoc({name,lat,lon});
            load(lat,lon,name);
          });
      },
      ()=>{
        // GPS denied/unavailable — stay on GPS tab, show manual button
        setLocating(false);
      },
      {timeout:8000, enableHighAccuracy:false}
    );
  },[]);

  function useGPS() {
    setLocating(true); setError(null);
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude:lat,longitude:lon}=pos.coords;
        setGpsLat(lat); setGpsLon(lon);
        setLocating(false);
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          {headers:{"Accept-Language":"en","User-Agent":"BridgeYachtApp/1.0"}})
          .then(r=>r.json())
          .then(d=>{
            const name = d.address
              ? [d.address.marina||d.address.harbour||d.address.suburb||d.address.city||d.address.town||d.address.village||d.address.county, d.address.country].filter(Boolean).join(", ")
              : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
            setLoc({name,lat,lon});
            setSearchQuery(name);
            load(lat,lon,name);
          })
          .catch(()=>{
            const name=`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
            setLoc({name,lat,lon});
            load(lat,lon,name);
          });
      },
      ()=>{ setLocating(false); setError("Location access denied — use Search to find your position."); },
      {timeout:10000, enableHighAccuracy:true}
    );
  }

  function useCustom() {
    const lat=parseFloat(customLat), lon=parseFloat(customLon);
    if(isNaN(lat)||isNaN(lon)){setError("Invalid coordinates.");return;}
    const name=`${lat.toFixed(3)}°, ${lon.toFixed(3)}°`;
    setLoc({name,lat,lon});
    load(lat,lon,name);
  }

  // ── Parsed values ──────────────────────────────────────────
  const cur    = wx?.atmo?.current;
  const daily  = wx?.atmo?.daily;
  const hourly = wx?.atmo?.hourly;
  const mcur   = wx?.marine?.current;
  const mdaily = wx?.marine?.daily;

  const tempC   = cur ? Math.round(cur.temperature_2m)       : null;
  const feelsC  = cur ? Math.round(cur.apparent_temperature) : null;
  const windKt  = cur ? ms2kt(cur.wind_speed_10m)            : null;
  const gustKt  = cur ? ms2kt(cur.wind_gusts_10m)            : null;
  const windDeg = cur?.wind_direction_10m;
  const hum     = cur?.relative_humidity_2m;
  const pres    = cur ? Math.round(cur.surface_pressure)     : null;
  const vis     = cur ? Math.round((cur.visibility||0)/1000) : null;
  const uvIdx   = cur ? Math.round(cur.uv_index||0)          : null;
  const cloud   = cur?.cloud_cover;

  const waveH   = mcur?.wave_height;
  const swellH  = mcur?.swell_wave_height;
  const swellDeg= mcur?.swell_wave_direction;
  const swellPer= mcur?.swell_wave_period;

  const sea     = waveH!=null ? getSeaState(waveH) : null;
  const bf      = windKt!=null ? bft(windKt) : null;
  const cc      = windKt!=null ? condColor(windKt, waveH||0) : C.muted;

  const condLabel = sea&&bf ? `${sea.label} — Bft ${bf.n} ${bf.d}` : (windKt!=null ? `Bft ${bft(windKt).n} ${bft(windKt).d}` : "Loading…");

  const opLabel = cc===C.greenL ? "✅ Good to Operate"
                : cc===C.amber  ? "Moderate Conditions"
                : cc===C.signal ? "Challenging — Caution"
                : "—";

  // ── 7-day forecast builder ─────────────────────────────────
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function dayForecast() {
    if(!daily?.time) return [];
    return daily.time.map((t,i)=>{
      const wKt  = daily.wind_speed_10m_max?.[i]!=null ? ms2kt(daily.wind_speed_10m_max[i]) : null;
      const gKt  = daily.wind_gusts_10m_max?.[i]!=null ? ms2kt(daily.wind_gusts_10m_max[i]) : null;
      const wDeg = daily.wind_direction_10m_dominant?.[i];
      const tMax = daily.temperature_2m_max?.[i]!=null ? Math.round(daily.temperature_2m_max[i]) : null;
      const tMin = daily.temperature_2m_min?.[i]!=null ? Math.round(daily.temperature_2m_min[i]) : null;
      const wvH  = mdaily?.wave_height_max?.[i];
      const day  = new Date(t+"T00:00:00");
      const lbl  = i===0?"Today":DAYS[day.getDay()];
      const c    = wKt!=null ? condColor(wKt, wvH||0) : C.muted;
      const cond = wKt!=null ? (c===C.greenL?"Good":c===C.amber?"Moderate":"Poor") : "—";
      return {date:t, label:lbl, wKt, gKt, wDeg, tMax, tMin, wvH, cond, condColor:c};
    });
  }

  // ── Hourly forecast builder (24h) ─────────────────────────
  function hourlyForecast() {
    if(!hourly?.time) return [];
    const now = new Date();
    return hourly.time.slice(0,24).map((t,i)=>{
      const dt   = new Date(t);
      const hStr = dt.toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit",hour12:false});
      const wKt  = hourly.wind_speed_10m?.[i]!=null ? ms2kt(hourly.wind_speed_10m[i]) : null;
      const gKt  = hourly.wind_gusts_10m?.[i]!=null ? ms2kt(hourly.wind_gusts_10m[i]) : null;
      const wDeg = hourly.wind_direction_10m?.[i];
      const temp = hourly.temperature_2m?.[i]!=null ? Math.round(hourly.temperature_2m[i]) : null;
      const c    = wKt!=null ? condColor(wKt, 0) : C.muted;
      return {time:hStr, wKt, gKt, wDeg, temp, condColor:c};
    });
  }

  const forecast = dayForecast();
  const hourlyFc = hourlyForecast();

  return <div>

    {/* Header */}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,gap:8,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.navy,display:"flex",alignItems:"center",gap:8}}><Ico i={Cloud} s={18} c={C.navy}/>{"Marine Weather"}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>
          {wx?.name||loc.name}
          {updated&&<span> · {updated}</span>}
        </div>
      </div>
      <button onClick={()=>load(loc.lat,loc.lon,loc.name)} disabled={loading}
        style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"5px 13px",fontSize:12}}>
        {loading?"…":"↻ Refresh"}
      </button>
    </div>

    {/* Location selector */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",marginBottom:12}}>
      <div style={{display:"flex",background:C.navyLight,borderRadius:7,padding:3,gap:2,marginBottom:10,width:"fit-content"}}>
        {[["gps","GPS"],["search","Search"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setLocMode(id)}
            style={{...btn,background:locMode===id?C.card:"transparent",color:locMode===id?C.navy:C.muted,padding:"4px 11px",fontSize:11,border:"none"}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* SEARCH — Nominatim / OpenStreetMap, free, no API key */}
      {locMode==="search"&&<div>
        <div style={{position:"relative"}}>
          <input
            value={searchQuery}
            onChange={e=>onSearchChange(e.target.value)}
            placeholder="Search any port, marina, anchorage or city…"
            style={{...inp,width:"100%",padding:"9px 36px 9px 12px",fontSize:13}}
          />
          {searching&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.muted}}>⟳</span>}
          {searchQuery&&!searching&&<span onClick={()=>{setSearchQuery("");setSearchResults([]);setSearchError(null);}}
            style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:16,color:C.muted,cursor:"pointer",lineHeight:1}}>×</span>}
        </div>
        {searchError&&<div style={{fontSize:11,color:C.signal,marginTop:6}}>{searchError}</div>}
        {searchResults.length>0&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
          {searchResults.map((r,i)=>(
            <button key={i} onClick={()=>selectSearchResult(r)} disabled={loading}
              style={{...btn,background:C.navyLight,color:C.text,border:`1px solid ${C.border}`,
                padding:"8px 12px",fontSize:12,textAlign:"left",borderRadius:7,fontWeight:400}}>
              {r.name}
            </button>
          ))}
        </div>}
        {!searchQuery&&<div style={{fontSize:11,color:C.muted,marginTop:6}}>
          Powered by OpenStreetMap · Free · No API key required
        </div>}
      </div>}

      {/* GPS — auto-detects on open, shows current location name */}
      {locMode==="gps"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {locating&&<div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:C.navyLight,borderRadius:8}}>
          <Ico i={MapPin} s={18} c={C.muted}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>Detecting your location…</div>
            <div style={{fontSize:10,color:C.muted}}>Using device GPS</div>
          </div>
        </div>}
        {!locating&&gpsLat&&<div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:8}}>
          <Ico i={MapPin} s={18} c={C.muted}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:C.greenL}}>{loc.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{gpsLat.toFixed(4)}°N, {gpsLon.toFixed(4)}°E</div>
          </div>
          <button onClick={useGPS} disabled={loading}
            style={{...btn,background:C.navyLight,color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:10}}>
            Refresh
          </button>
        </div>}
        {!locating&&!gpsLat&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>
            Location not yet detected. Tap below to allow access, or switch to Search.
          </div>
          <button onClick={useGPS} disabled={locating||loading}
            style={{...btn,background:C.brass,color:C.bg,display:"flex",alignItems:"center",gap:6,padding:"10px 16px",fontSize:12,fontWeight:700}}>
            Use My Current Location
          </button>
        </div>}
      </div>}


    </div>

    {error&&<div style={{background:C.signal+"18",border:`1px solid ${C.signal}44`,borderRadius:8,padding:"9px 13px",marginBottom:11,fontSize:12,color:C.signal}}>{error}</div>}

    {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:30,textAlign:"center",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Ico i={Waves} s={32} c={C.blue}/></div>
      <div style={{fontSize:13,color:C.text,fontWeight:600}}>Fetching marine weather…</div>
      <div style={{fontSize:11,color:C.muted,marginTop:3}}>Open-Meteo · Free · No API key</div>
    </div>}

    {!loading&&wx&&<>

      {/* Operational status banner */}
      <div style={{background:`${cc}18`,border:`1px solid ${cc}55`,borderRadius:11,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:15,fontWeight:800,color:cc}}>{opLabel}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{condLabel}</div>
          <div style={{fontSize:11,color:C.text,marginTop:3}}>
            {windKt!=null&&`Wind ${windKt}kt ${windDeg!=null?windDir(windDeg):""}`}
            {waveH!=null&&` · Waves ${waveH.toFixed(1)}m`}
            {swellH!=null&&` · Swell ${swellH.toFixed(1)}m`}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:30,fontWeight:900,color:C.white}}>{tempC!=null?`${tempC}°C`:"—"}</div>
          <div style={{fontSize:11,color:C.muted}}>Feels {feelsC!=null?`${feelsC}°C`:"—"}</div>
        </div>
      </div>

      {/* AI Captain's Briefing */}
      <div style={{background:C.card,border:`1px solid ${aiBriefing?.status==="red"?C.signal:aiBriefing?.status==="amber"?C.amber:C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>AI Captain's Briefing</div>
          <button onClick={()=>loadAIBriefing(wx,wx.name)} disabled={aiLoading}
            style={{...btn,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"3px 9px",fontSize:10}}>
            {aiLoading?"…":"↻"}
          </button>
        </div>

        {aiLoading&&<div style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:12,padding:"6px 0"}}>
          <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>
          Analysing conditions…
        </div>}

        {aiError&&!aiLoading&&<div style={{fontSize:12,color:C.signal}}>{aiError}</div>}

        {aiBriefing&&!aiLoading&&<>
          {/* Headline */}
          <div style={{fontSize:13,fontWeight:700,color:aiBriefing.status==="red"?C.signal:aiBriefing.status==="amber"?C.amber:C.greenL,marginBottom:8,lineHeight:1.4}}>
            {aiBriefing.headline}
          </div>
          {/* Insights */}
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
            {(aiBriefing.insights||[]).map((ins,i)=>{
              const col = ins.level==="red"?C.signal:ins.level==="amber"?C.amber:C.greenL;
              return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12}}>
                <span style={{flexShrink:0,display:"flex",alignItems:"center"}}><Ico i={ins.IconC||Cloud} s={14} c={ins.color||C.muted}/></span>
                <span style={{color:col,lineHeight:1.4}}>{ins.text}</span>
              </div>;
            })}
          </div>
          {/* Outlook */}
          {aiBriefing.outlook&&<div style={{fontSize:11,color:C.muted,borderTop:`1px solid ${C.border}`,paddingTop:7,lineHeight:1.5}}>
            <em>{aiBriefing.outlook}</em>
          </div>}
        </>}

        {!aiBriefing&&!aiLoading&&!aiError&&<div style={{fontSize:12,color:C.muted}}>Briefing will appear after weather loads.</div>}
      </div>

      {/* View tabs */}
      <div style={{display:"flex",background:C.navyLight,borderRadius:8,padding:3,gap:2,marginBottom:12}}>
        {[["current","Current"],["forecast","7-Day"],["hourly","24h Hourly"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{...btn,flex:1,background:tab===id?C.card:"transparent",color:tab===id?C.navy:C.muted,
              border:"none",padding:"6px 0",fontSize:12,fontWeight:tab===id?700:400}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── CURRENT CONDITIONS ── */}
      {tab==="current"&&<>
        <SectionLabel>Wind</SectionLabel>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"stretch"}}>
          <div style={{background:C.navyLight,borderRadius:9,padding:"11px 13px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            {windDeg!=null&&<WindArrow deg={windDeg} size={36}/>}
            <div>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>Direction</div>
              <div style={{fontSize:18,fontWeight:700,color:C.text}}>{windDeg!=null?windDir(windDeg):"—"}</div>
              <div style={{fontSize:10,color:C.muted}}>{windDeg!=null?`${Math.round(windDeg)}°`:"—"}</div>
            </div>
          </div>
          <WxTile label="Wind Speed" value={windKt} unit="kt"
            color={windKt>30?C.signal:windKt>20?C.amber:C.greenL}
            sub={bf?`Bft ${bf.n} · ${bf.d}`:""}/>
          <WxTile label="Wind Gusts" value={gustKt} unit="kt"
            color={gustKt>35?C.signal:gustKt>25?C.amber:C.white}/>
          <WxTile label="Pressure" value={pres} unit="hPa" icon="🌡️"/>
          <WxTile label="Humidity" value={hum!=null?`${hum}%`:null} icon="💧"/>
        </div>

        <SectionLabel>Marine Conditions</SectionLabel>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <WxTile label="Wave Height" value={waveH!=null?waveH.toFixed(1):null} unit="m"
            color={sea?.color} icon="🌊" sub={waveH!=null?`${(waveH*3.281).toFixed(1)} ft`:""}/>
          <WxTile label="Sea State" value={sea?.label} color={sea?.color}/>
          <WxTile label="Swell Height" value={swellH!=null?swellH.toFixed(1):null} unit="m"
            sub={swellH!=null?`${(swellH*3.281).toFixed(1)} ft`:""}/>
          <WxTile label="Swell Dir" value={swellDeg!=null?windDir(swellDeg):null}
            sub={swellDeg!=null?`${Math.round(swellDeg)}°`:""}/>
          <WxTile label="Swell Period" value={swellPer!=null?`${Math.round(swellPer)}s`:null} icon="⏱️"/>
        </div>

        <SectionLabel>Atmosphere</SectionLabel>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:8}}>
          <WxTile label="Visibility" value={vis!=null?`${vis}km`:null} icon="👁️"
            color={vis<2?C.signal:vis<5?C.amber:C.greenL}/>
          <WxTile label="Cloud Cover" value={cloud!=null?`${cloud}%`:null} icon="☁️"/>
          <WxTile label="UV Index" value={uvIdx} icon="☀️"
            color={uvIdx>10?C.signal:uvIdx>6?C.amber:C.greenL}/>
          <WxTile label="Sunrise" value={daily?.sunrise?.[0]?.slice(11,16)} icon="🌅"/>
          <WxTile label="Sunset"  value={daily?.sunset?.[0]?.slice(11,16)}  icon="🌇"/>
        </div>

        <div style={{fontSize:10,color:C.muted,textAlign:"right",marginTop:6}}>
          Open-Meteo · {loc.lat.toFixed(4)}°, {loc.lon.toFixed(4)}° · {updated}
        </div>
      </>}

      {/* ── 7-DAY FORECAST ── */}
      {tab==="forecast"&&<div>
        {forecast.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:24}}>No forecast data</div>}
        {forecast.map((day,i)=>(
          <div key={i} style={{background:i===0?`${day.condColor}15`:C.card,border:`1px solid ${i===0?day.condColor+"44":C.border}`,
            borderRadius:10,padding:"11px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {/* Day label */}
            <div style={{width:52,flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:i===0?800:600,color:i===0?C.white:C.text}}>{day.label}</div>
              <div style={{fontSize:10,color:C.muted}}>{day.date?.slice(5)}</div>
            </div>
            {/* Condition badge */}
            <div style={{padding:"3px 9px",borderRadius:20,background:`${day.condColor}22`,
              border:`1px solid ${day.condColor}44`,fontSize:11,fontWeight:700,color:day.condColor,flexShrink:0}}>
              {day.cond}
            </div>
            {/* Wind */}
            <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:120}}>
              {day.wDeg!=null&&<WindArrow deg={day.wDeg} size={22}/>}
              <div>
                <div style={{fontSize:13,fontWeight:700,color:day.wKt>30?C.signal:day.wKt>20?C.amber:C.white}}>
                  {day.wKt!=null?`${day.wKt}kt`:"-"}
                  {day.gKt!=null&&<span style={{fontSize:11,color:C.muted}}> G{day.gKt}</span>}
                </div>
                <div style={{fontSize:10,color:C.muted}}>{day.wDeg!=null?windDir(day.wDeg):"—"} Wind</div>
              </div>
            </div>
            {/* Wave */}
            {day.wvH!=null&&<div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:700,color:getSeaState(day.wvH).color}}>{day.wvH.toFixed(1)}m</div>
              <div style={{fontSize:10,color:C.muted}}>Waves</div>
            </div>}
            {/* Temp */}
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{day.tMax!=null?`${day.tMax}°`:"—"}</div>
              <div style={{fontSize:10,color:C.muted}}>{day.tMin!=null?`${day.tMin}°`:""}</div>
            </div>
          </div>
        ))}
      </div>}

      {/* ── HOURLY FORECAST ── */}
      {tab==="hourly"&&<div>
        <div style={{fontSize:11,color:C.muted,marginBottom:9}}>Next 24 hours · Wind, gusts & temperature</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {hourlyFc.map((h,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,
              padding:"8px 13px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:44,flexShrink:0,fontSize:12,color:i===0?C.brass:C.muted,fontWeight:i===0?700:400}}>{i===0?"Now":h.time}</div>
              {h.wDeg!=null&&<WindArrow deg={h.wDeg} size={20}/>}
              <div style={{flex:1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,color:h.condColor}}>{h.wKt!=null?`${h.wKt}kt`:"—"}</span>
                {h.gKt!=null&&<span style={{fontSize:11,color:C.muted}}>G{h.gKt}</span>}
                <span style={{fontSize:11,color:C.muted}}>{h.wDeg!=null?windDir(h.wDeg):"—"}</span>
              </div>
              <div style={{fontSize:12,color:C.text,flexShrink:0}}>{h.temp!=null?`${h.temp}°C`:"—"}</div>
            </div>
          ))}
        </div>
      </div>}

    </>}

    {/* Weather AI Chat floating button */}
    <FloatingAI label="Voyage & Weather Planner" color={C.blue}>
      <AIWeatherChat wx={wx} loc={loc}/>
    </FloatingAI>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════

const NOTIF_CATS = {
  task:        { label:"Tasks",        IconC:CheckCircle,  color:"#25b085" },
  maintenance: { label:"Maintenance",  IconC:Wrench,       color:"#e07b39" },
  inventory:   { label:"Inventory",    IconC:Package,      color:"#6b8cba" },
  document:    { label:"Documents",    IconC:FileText,     color:"#9b59b6" },
  brief:       { label:"Daily Brief",  IconC:Compass,      color:"#c9a84c" },
  charter:     { label:"Charter",      IconC:Ship,         color:"#c9a84c" },
  leave:       { label:"Leave",        IconC:Umbrella,     color:"#3b9fd4" },
  system:      { label:"System",       IconC:Bell,         color:"#6b7f99" },
};

function makeNotif(cat, title, body, link={}, dept=null) {
  return {
    id:    `n_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    cat,
    dept,  // which department this notification belongs to
    title,
    body,
    link,
    ts:     new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
    read:   false,
  };
}

// Push a browser/PWA notification if permission granted
function pushBrowserNotif(title, body) {
  if(typeof Notification === "undefined") return;
  if(Notification.permission === "granted") {
    try { new Notification(title, { body, icon:"⛵" }); } catch(e) {}
  }
}

// Request browser notification permission
async function requestNotifPermission() {
  if(typeof Notification === "undefined") return "unsupported";
  if(Notification.permission === "default") {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

// ── NOTIFICATION CENTRE PANEL ─────────────────────────────────
const DEPT_COLORS = {
  Engineering: "#e07b39",
  Deck:        "#3b9fd4",
  Interior:    "#9b59b6",
  Galley:      "#25b085",
  Command:     "#c9a84c",
};

function NotificationCentre({ notifications, setNotifications, setView, onClose }) {
  const [catFilter,  setCatFilter]  = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const unread = notifications.filter(n=>!n.read).length;

  // Active depts present in notifications
  const activeDepts = [...new Set(notifications.map(n=>n.dept).filter(Boolean))];

  const visible = notifications
    .filter(n => catFilter==="all"  || n.cat===catFilter)
    .filter(n => deptFilter==="all" || n.dept===deptFilter);

  function markRead(id) {
    setNotifications(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  }
  function markAllRead() {
    setNotifications(p=>p.map(n=>({...n,read:true})));
  }
  function dismiss(id) {
    setNotifications(p=>p.filter(n=>n.id!==id));
  }
  function clearAll() {
    setNotifications([]);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(7,16,31,.92)",zIndex:900,display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{width:"min(420px,100vw)",height:"100dvh",background:C.card,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflowY:"hidden"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:C.navy}}>{"Notifications"}</div>
              {unread>0&&<div style={{fontSize:11,color:C.amber,marginTop:2}}>{unread}{" unread"}</div>}
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              {unread>0&&<button onClick={markAllRead} style={{...btn,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"4px 10px",fontSize:11}}>{"Mark all read"}</button>}
              {notifications.length>0&&<button onClick={clearAll} style={{...btn,background:"transparent",color:C.muted,border:"none",padding:"4px 8px",fontSize:11}}>{"Clear"}</button>}
              <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:0}}>{"×"}</button>
            </div>
          </div>

          {/* Category filter */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
            <button onClick={()=>setCatFilter("all")} style={{...btn,background:catFilter==="all"?C.navyLight:"transparent",color:catFilter==="all"?C.white:C.muted,border:`1px solid ${catFilter==="all"?C.border:"transparent"}`,padding:"3px 10px",fontSize:11}}>
              {"All"}{notifications.length>0&&<span style={{marginLeft:4,opacity:.6}}>{"("+notifications.length+")"}</span>}
            </button>
            {Object.entries(NOTIF_CATS).filter(([k])=>notifications.some(n=>n.cat===k)).map(([k,v])=>(
              <button key={k} onClick={()=>setCatFilter(k)}
                style={{...btn,background:catFilter===k?v.color+"22":"transparent",color:catFilter===k?v.color:C.muted,
                  border:`1px solid ${catFilter===k?v.color+"44":"transparent"}`,padding:"3px 10px",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                <Ico i={v.IconC} s={11} c={catFilter===k?v.color:C.muted}/>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
          {/* Department filter — only shown if multiple depts present */}
          {activeDepts.length>1&&<div style={{display:"flex",gap:5,flexWrap:"wrap",paddingTop:6,borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setDeptFilter("all")} style={{...btn,background:deptFilter==="all"?C.navyLight:"transparent",color:deptFilter==="all"?C.white:C.muted,border:`1px solid ${deptFilter==="all"?C.border:"transparent"}`,padding:"2px 9px",fontSize:10}}>All Depts</button>
            {activeDepts.map(d=>(
              <button key={d} onClick={()=>setDeptFilter(d)}
                style={{...btn,background:deptFilter===d?(DEPT_COLORS[d]||C.blue)+"22":"transparent",color:deptFilter===d?(DEPT_COLORS[d]||C.blue):C.muted,
                  border:`1px solid ${deptFilter===d?(DEPT_COLORS[d]||C.blue)+"44":"transparent"}`,padding:"2px 9px",fontSize:10}}>
                {d}
              </button>
            ))}
          </div>}
        </div>

        {/* Notification list */}
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          {visible.length===0&&<div style={{padding:"48px 20px",textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Ico i={Bell} s={32} c={C.muted}/></div>
            <div style={{fontSize:13,color:C.muted}}>{catFilter==="all"&&deptFilter==="all"?"No notifications yet":catFilter!=="all"?"No "+NOTIF_CATS[catFilter]?.label+" notifications":"No "+deptFilter+" notifications"}</div>
          </div>}

          {visible.map(n=>{
            const cat = NOTIF_CATS[n.cat]||NOTIF_CATS.system;
            return (
              <div key={n.id}
                style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,background:n.read?"transparent":cat.color+"08",cursor:n.link?.module?"pointer":"default"}}
                onClick={()=>{
                  markRead(n.id);
                  if(n.link?.module) { setView(n.link.module); onClose(); }
                }}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:34,height:34,borderRadius:8,background:cat.color+"22",border:`1px solid ${cat.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {cat.IconC&&<Ico i={cat.IconC} s={16} c={cat.color}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:3}}>
                      <div style={{fontSize:13,fontWeight:n.read?600:800,color:n.read?C.text:C.white,lineHeight:1.3}}>{n.title}</div>
                      {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:cat.color,flexShrink:0,marginTop:4}}/>}
                    </div>
                    {n.body&&<div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:4}}>{n.body}</div>}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <span style={{fontSize:10,color:C.muted}}>{n.ts}</span>
                        {n.dept&&<span style={{fontSize:9,background:(DEPT_COLORS[n.dept]||C.blue)+"22",color:DEPT_COLORS[n.dept]||C.blue,padding:"1px 6px",borderRadius:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{n.dept}</span>}
                      </div>
                      {n.link?.label&&<span style={{fontSize:10,color:cat.color,fontWeight:600}}>{"→ "+n.link.label}</span>}
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();dismiss(n.id);}}
                    style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"0 0 0 4px",flexShrink:0,lineHeight:1}}>{"×"}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATION ENGINE — runs inside Bridge via useEffect ─────
// Scans all module data and generates notifications.
// Only adds notifications that don't already exist (deduplication by key).
function useNotificationEngine({ tasks, crew, docs, assets, jobs, inventory, calEntries, leaveRequests, notifications, setNotifications, role, schedules }) {
  // ── Strict dept-based routing ─────────────────────────────
  // Captain  → ALL notifications
  // Engineer → Engineering tasks + maintenance only
  // Stew     → Interior tasks only
  // Deckhand → Deck tasks only
  // Chef     → Galley tasks only
  // Management / Owner / Agent → NONE (no bell shown)
  const isCommand = role === "captain";
  const myDept =
    role==="engineer" ? "Engineering" :
    role==="stew"     ? "Interior"    :
    role==="deckhand" ? "Deck"        :
    role==="chef"     ? "Galley"      : null;
  const canReceive = isCommand || myDept !== null;

  // Does this role care about this notification category?
  function wantsCat(cat) {
    if(isCommand) return true;
    if(myDept==="Engineering") return ["task","maintenance","inventory"].includes(cat);
    if(myDept==="Interior")    return ["task","inventory"].includes(cat);
    if(myDept==="Deck")        return ["task","inventory"].includes(cat);
    if(myDept==="Galley")      return ["task","inventory"].includes(cat);
    return false;
  }

  // Does this task belong to this role's dept?
  function wantsTask(t) {
    if(isCommand) return true;
    const myCrewIdN = crew.find(c=>c.role===role)?.id;
    return t.dept === myDept || t.assignedTo === role || 
      (myCrewIdN && (t.assignedTo===myCrewIdN || t.assignedToId===myCrewIdN));
  }

  function alreadyExists(key) {
    return notifications.some(n=>n.id===key||n._key===key);
  }

  function push(key, cat, title, body, link={}, dept=null) {
    if(!wantsCat(cat)) return;
    if(alreadyExists(key)) return;
    // Auto-derive dept from category if not supplied
    const resolvedDept = dept || (
      cat==="maintenance" ? "Engineering" :
      cat==="document"||cat==="compliance"||cat==="brief" ? "Command" :
      myDept || null
    );
    const n = {...makeNotif(cat,title,body,link,resolvedDept), _key:key};
    setNotifications(p=>[n,...p]);
    pushBrowserNotif(title, body);
  }

  useEffect(()=>{
    if(!canReceive) return;

    // ── TASK NOTIFICATIONS ──────────────────────────────────
    // Captain: all tasks. Engineer: Engineering tasks. Stew: Interior. Deckhand: Deck. Chef: Galley.
    const activeTask = t => t.status!=="Completed" && t.status!=="Approved" && t.dueDate;

    const overdueTasks = tasks.filter(t=>activeTask(t)&&wantsTask(t)&&t.dueDate<TODAY);
    overdueTasks.forEach(t=>{
      push(`task_overdue_${t.id}`, "task",
        `⏰ Task Overdue: ${t.title}`,
        `Assigned to ${ROLES[t.assignedTo]?.label||t.assignedTo} · Due ${t.dueDate}`,
        {module:"tasks", id:t.id, label:"View Task"}, t.dept||myDept
      );
    });

    const dueTodayTasks = tasks.filter(t=>activeTask(t)&&wantsTask(t)&&t.dueDate===TODAY);
    dueTodayTasks.forEach(t=>{
      push(`task_due_today_${t.id}`, "task",
        `📋 Task Due Today: ${t.title}`,
        `${ROLES[t.assignedTo]?.label||t.assignedTo} · ${t.priority} priority`,
        {module:"tasks", id:t.id, label:"View Task"}, t.dept||myDept
      );
    });

    // ── MAINTENANCE NOTIFICATIONS ───────────────────────────
    // Engineering dept + Command receive maintenance alerts
    if(wantsCat("maintenance")) {
      const overdueJobs = jobs.filter(j=>j.status!=="Done"&&j.dueDate&&j.dueDate<TODAY);
      overdueJobs.forEach(j=>{
        push(`maint_overdue_${j.id}`, "maintenance",
          `🔧 Maintenance Overdue: ${j.title}`,
          `Due ${j.dueDate} · ${j.priority||"Medium"} priority`,
          {module:"maintenance", id:j.id, label:"View Job"}
        );
      });

      const dueTodayJobs = jobs.filter(j=>j.status!=="Done"&&j.dueDate===TODAY);
      dueTodayJobs.forEach(j=>{
        push(`maint_due_today_${j.id}`, "maintenance",
          `⚙️ Maintenance Due Today: ${j.title}`,
          j.notes||"",
          {module:"maintenance", id:j.id, label:"View Job"}
        );
      });

      assets.forEach(a=>{
        if(!a.nextServiceHours||!a.currentHours) return;
        const remaining = a.nextServiceHours - a.currentHours;
        if(remaining<=0) {
          push(`asset_hours_overdue_${a.id}`, "maintenance",
            `🔴 Service Overdue: ${a.name}`,
            `${a.currentHours}h logged — service was due at ${a.nextServiceHours}h`,
            {module:"maintenance", label:"View Assets"}
          );
        } else if(remaining<=50) {
          push(`asset_hours_soon_${a.id}`, "maintenance",
            `⚠️ Service Due Soon: ${a.name}`,
            `${remaining}h remaining until next service`,
            {module:"maintenance", label:"View Assets"}
          );
        }
      });
    }

    // ── INVENTORY NOTIFICATIONS ─────────────────────────────
    // Captain: all. Engineer: Spare Parts/Engineering. Stew: Interior/Housekeeping.
    // Chef: Provisions/Galley. Deckhand: Deck/Safety.
    if(wantsCat("inventory")) {
      inventory.forEach(item=>{
        const itemDept =
          (item.category==="Spare Parts"||item.category==="Engineering") ? "Engineering" :
          (item.category==="Provisions"||item.category==="Galley"||item.category==="Food") ? "Galley" :
          (item.category==="Interior"||item.category==="Housekeeping"||item.category==="Guest Supplies") ? "Interior" :
          (item.category==="Deck"||item.category==="Safety"||item.category==="Watersports") ? "Deck" :
          null;
        if(!isCommand) {
          if(itemDept !== myDept && itemDept !== null) return;
          if(itemDept === null) return;
        }
        if(item.qty<=0) {
          push(`inv_critical_${item.id}`, "inventory",
            `🚨 Critical: ${item.name} — Out of Stock`,
            `${item.category||"Inventory"} · Reorder immediately`,
            {module:"inventory", id:item.id, label:"View Inventory"}, itemDept||myDept
          );
        } else if(item.reorderAt&&item.qty<=item.reorderAt) {
          push(`inv_low_${item.id}`, "inventory",
            `📦 Low Stock: ${item.name}`,
            `${item.qty} ${item.unit||"units"} remaining · Reorder level: ${item.reorderAt}`,
            {module:"inventory", id:item.id, label:"View Inventory"}, itemDept||myDept
          );
        }
      });
    }

    // ── DOCUMENT / COMPLIANCE NOTIFICATIONS ────────────────
    // Captain + Command positions only
    if(wantsCat("document")||wantsCat("compliance")) {
      const allDocs = [
        ...docs,
        ...crew.flatMap(c=>(c.documents||[]).map(d=>({...d, ownerName:c.name}))),
      ];
      allDocs.forEach(doc=>{
        if(!doc.expiry) return;
        const daysLeft = Math.round((new Date(doc.expiry)-new Date(TODAY))/(1000*60*60*24));
        const who = doc.ownerName ? ` (${doc.ownerName})` : "";
        if(daysLeft<0) {
          push(`doc_expired_${doc.id}`, "document",
            `🔴 EXPIRED: ${doc.name||doc.type}${who}`,
            `Expired ${Math.abs(daysLeft)} days ago`,
            {module:"documents", id:doc.id, label:"View Document"}
          );
        } else if(daysLeft<=7) {
          push(`doc_7d_${doc.id}`, "document",
            `🚨 Expires in ${daysLeft} days: ${doc.name||doc.type}${who}`,
            `Expiry: ${doc.expiry}`,
            {module:"documents", id:doc.id, label:"View Document"}
          );
        } else if(daysLeft<=30) {
          push(`doc_30d_${doc.id}`, "document",
            `⚠️ Expires in ${daysLeft} days: ${doc.name||doc.type}${who}`,
            `Expiry: ${doc.expiry}`,
            {module:"documents", id:doc.id, label:"View Document"}
          );
        } else if(daysLeft<=90) {
          push(`doc_90d_${doc.id}`, "document",
            `📄 Expiry in ${daysLeft} days: ${doc.name||doc.type}${who}`,
            `Expiry: ${doc.expiry}`,
            {module:"documents", id:doc.id, label:"View Document"}
          );
        }
      });
    }

  // eslint-disable-next-line
  }, [tasks, jobs, assets, inventory, docs, crew]);

  // ── DAILY CAPTAIN BRIEF ───────────────────────────────────
  useEffect(()=>{
    if(!isCommand) return;
    const briefKey = `daily_brief_${TODAY}`;
    if(alreadyExists(briefKey)) return;

    const incompleteTasks  = tasks.filter(t=>t.status!=="Completed"&&t.status!=="Approved"&&t.dueDate===TODAY);
    const maintToday       = jobs.filter(j=>j.status!=="Done"&&j.dueDate===TODAY);
    const openFaults       = jobs.filter(j=>j.status!=="Done"&&j.priority==="Critical");
    const invAlerts        = inventory.filter(i=>i.reorderAt&&i.qty<=i.reorderAt);
    const expiringDocs     = [...docs,...crew.flatMap(c=>(c.documents||[]))].filter(d=>{
      if(!d.expiry) return false;
      const dl = Math.round((new Date(d.expiry)-new Date(TODAY))/(1000*60*60*24));
      return dl>=0&&dl<=30;
    });
    const upcomingCharters = calEntries.filter(e=>e.type==="Booked"&&e.start>=TODAY).slice(0,2);

    const parts = [];
    if(incompleteTasks.length)  parts.push(`${incompleteTasks.length} task${incompleteTasks.length!==1?"s":""} due today`);
    if(maintToday.length)       parts.push(`${maintToday.length} maintenance job${maintToday.length!==1?"s":""} due`);
    if(openFaults.length)       parts.push(`${openFaults.length} critical fault${openFaults.length!==1?"s":""} open`);
    if(invAlerts.length)        parts.push(`${invAlerts.length} inventory alert${invAlerts.length!==1?"s":""}`);
    if(expiringDocs.length)     parts.push(`${expiringDocs.length} document${expiringDocs.length!==1?"s":""} expiring soon`);
    if(upcomingCharters.length) parts.push(`Next charter: ${upcomingCharters[0].title} ${upcomingCharters[0].start}`);

    const body = parts.length ? parts.join(" · ") : "All clear — no urgent items today.";
    push(briefKey, "brief", "🧭 Captain's Daily Brief", body, {module:"dashboard", label:"Go to Dashboard"});
  // eslint-disable-next-line
  }, [TODAY]);

  // ── END-OF-DAY TASK REMINDERS ────────────────────────────
  useEffect(()=>{
    if(!canReceive) return;
    const now = new Date();
    const h   = now.getHours();

    if(h>=17) {
      const myCrewIdP = crew.find(c=>c.role===role)?.id;
      const pendingForRole = tasks.filter(t=>(t.assignedTo===role||(myCrewIdP&&(t.assignedTo===myCrewIdP||t.assignedToId===myCrewIdP)))&&(t.status==="In Progress"||t.status==="Pending"));
      if(pendingForRole.length>0) {
        push(`eod_crew_${TODAY}_${role}`, "task",
          "📋 End of Day — Log Your Tasks",
          `You have ${pendingForRole.length} incomplete task${pendingForRole.length!==1?"s":""} today. Please update your progress.`,
          {module:"tasks", label:"Go to Tasks"}
        );
      }
    }

    if(h>=18&&isCommand) {
      const incomplete = tasks.filter(t=>t.status!=="Completed"&&t.status!=="Approved");
      if(incomplete.length>0) {
        const byDept = {};
        incomplete.forEach(t=>{ byDept[t.dept]=(byDept[t.dept]||0)+1; });
        const breakdown = Object.entries(byDept).map(([d,n])=>`${d}:${n}`).join(" · ");
        push(`eod_captain_${TODAY}`, "task",
          `🧭 End of Day Summary — ${incomplete.length} Tasks Outstanding`,
          breakdown,
          {module:"tasks", label:"View Tasks"}
        );
      }
    }
  // eslint-disable-next-line
  }, []);
}

export default function Bridge() {
  // Inject toast CSS
  React.useEffect(()=>{
    if(!document.getElementById("bridge-toast-css")){
      const s=document.createElement("style");s.id="bridge-toast-css";
      s.textContent="@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}";
      document.head.appendChild(s);
    }
  },[]);
  // Dynamic user list — crew records + fixed roles
  // crew declared first so dynamicUsers can use it
  const {toasts, show:showToast} = useToast();
  const [crew,setCrew] = useState(INIT_CREW);

  const dynamicUsers = React.useMemo(()=>{
    const crewUsers = crew
      .filter(c=>c.role&&c.name&&!["owner","management","agent"].includes(c.role))
      .map(c=>({
        id: c.id,
        name: c.name,
        role: c.role,
        position: c.position,
        avatar: c.avatar||c.name.slice(0,2).toUpperCase(),
      }));
    return [
      FIXED_USERS[0], // owner
      FIXED_USERS[1], // management
      ...crewUsers,
      FIXED_USERS[2], // agent last
    ];
  },[crew]);
  const [user,setUser] = useState(()=>{
    const captain = INIT_CREW.find(c=>c.role==="captain");
    if(captain) return {id:captain.id,name:captain.name,role:captain.role,position:captain.position};
    return FIXED_USERS[1];
  });
  const [view,setViewRaw]    = useState("dashboard");

  // ── BACK BUTTON SUPPORT (Android, iOS swipe, desktop browser) ──
  // Each navigation pushes a history entry. Back button pops it.
  function setView(newView) {
    if(newView===view) return;
    window.history.pushState({view:newView}, "", "");
    setViewRaw(newView);
  }

  useEffect(()=>{
    // Seed initial history entry so first back-press goes to dashboard
    window.history.replaceState({view:"dashboard"}, "", "");
    const onPop = (e)=>{
      const v = e.state?.view||"dashboard";
      setViewRaw(v); // use raw setter — don't push another history entry
    };
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[]);
  const [tasks,setTasks]     = useState(INIT_TASKS);
  const [leaveRequests,setLeaveRequests] = useState(INIT_LEAVE);
  const [hoursLog,setHoursLog]           = useState([]); // MLC hours of rest records
  const [docs,setDocs]       = useState(INIT_DOCS);
  const [initFilter,setInitFilter] = useState(null);
  const [crewFilter,setCrewFilter] = useState(null);
  const [docFilter,setDocFilter]   = useState(null);
  const [collapsed,setCollapsed]   = useState(window.innerWidth<768);
  const [auditLog,setAuditLog]     = useState(INIT_AUDIT);
  const [assets,setAssets]         = useState(INIT_ASSETS);
  const [jobs,setJobs]             = useState(INIT_JOBS);
  const [inventory,setInventory]   = useState(INIT_INVENTORY);
  const [logbook,setLogbook]       = useState(INIT_LOGBOOK);
  const [weatherLocation,setWeatherLocation] = useState(null);
  const [liveWeather,setLiveWeather]         = useState(null); // shared weather snapshot for logbook
  // ── Vessel Registry — multi-vessel, AI-queryable ─────────────
  const [vesselRegistry, setVesselRegistry] = useState(INIT_VESSEL_REGISTRY);
  // Active vessel = the Bridge-native vessel (index 0 = M/Y Tiberius)
  const [activeVesselId, setActiveVesselId] = useState(null);
  const [initCalView,    setInitCalView]    = useState(null); // 'vessel' | null — opens CalendarModule at specific tab
  const activeVessel     = vesselRegistry.find(v=>v.id===activeVesselId) || vesselRegistry[0];
  const calEntries       = activeVessel?.calEntries || [];
  const setCalEntries    = (updater) => setVesselRegistry(reg=>reg.map(v=>v.id===activeVessel.id?{...v, calEntries:typeof updater==="function"?updater(v.calEntries):updater, updatedAt:new Date().toISOString()}:v));
  const [enquiries, setEnquiries]            = useState([]);
  // Keep user in sync with crew changes (name/position updates)
  React.useEffect(()=>{
    const updated = dynamicUsers.find(u=>u.id===user.id);
    if(updated&&(updated.name!==user.name||updated.position!==user.position)) {
      setUser(updated);
    }
  },[dynamicUsers]);
  const role=user.role, ri=ROLES[role]||ROLES.deckhand;
  // Per-role notification store — each role has its own independent notifications
  const DEMO_NOTIFS_BY_ROLE = {
    captain: [
      {id:"demo_1",cat:"maintenance",dept:"Engineering",title:"🔧 Engine Service Overdue: Port Main",body:"250hr service was due 3 days ago — schedule with Chief Engineer",link:{module:"maintenance",label:"View Job"},ts:"Today 07:00",read:false,_key:"demo_1"},
      {id:"demo_2",cat:"task",dept:"Deck",title:"⏰ Task Overdue: Anchor Chain Inspection",body:"Assigned to Bosun · Due 2 days ago",link:{module:"tasks",label:"View Task"},ts:"Today 07:00",read:false,_key:"demo_2"},
      {id:"demo_3",cat:"inventory",dept:"Galley",title:"📦 Low Stock: Olive Oil",body:"2 litres remaining · Reorder level: 5",link:{module:"inventory",label:"View Inventory"},ts:"Today 07:01",read:false,_key:"demo_3"},
      {id:"demo_4",cat:"inventory",dept:"Interior",title:"🚨 Critical: Guest Towels — Out of Stock",body:"Interior · Reorder immediately",link:{module:"inventory",label:"View Inventory"},ts:"Today 07:01",read:false,_key:"demo_4"},
      {id:"demo_5",cat:"document",dept:"Command",title:"⚠️ Expires in 18 days: Safety Management Certificate",body:"Expiry: 2026-07-12",link:{module:"documents",label:"View Document"},ts:"Today 07:02",read:false,_key:"demo_5"},
      {id:"demo_6",cat:"brief",dept:"Command",title:"🧭 Captain's Daily Brief",body:"2 tasks due today · 1 maintenance job · 1 inventory alert",link:{module:"dashboard",label:"Go to Dashboard"},ts:"Today 07:00",read:false,_key:"demo_6"},
      {id:"demo_7",cat:"maintenance",dept:"Engineering",title:"⚠️ Service Due Soon: Generator A",body:"48h remaining until next service",link:{module:"maintenance",label:"View Assets"},ts:"Today 08:15",read:true,_key:"demo_7"},
      {id:"demo_8",cat:"task",dept:"Interior",title:"📋 Task Due Today: Cabin Turnover — Guest 4",body:"Chief Stewardess · High priority",link:{module:"tasks",label:"View Task"},ts:"Today 09:00",read:true,_key:"demo_8"},
    ],
    engineer: [
      {id:"demo_1",cat:"maintenance",dept:"Engineering",title:"🔧 Engine Service Overdue: Port Main",body:"250hr service was due 3 days ago — log with Captain",link:{module:"maintenance",label:"View Job"},ts:"Today 07:00",read:false,_key:"demo_1"},
      {id:"demo_7",cat:"maintenance",dept:"Engineering",title:"⚠️ Service Due Soon: Generator A",body:"48h remaining until next service",link:{module:"maintenance",label:"View Assets"},ts:"Today 08:15",read:false,_key:"demo_7"},
    ],
    deckhand: [
      {id:"demo_2",cat:"task",dept:"Deck",title:"⏰ Task Overdue: Anchor Chain Inspection",body:"Assigned to Bosun · Due 2 days ago",link:{module:"tasks",label:"View Task"},ts:"Today 07:00",read:false,_key:"demo_2"},
    ],
    stew: [
      {id:"demo_4",cat:"inventory",dept:"Interior",title:"🚨 Critical: Guest Towels — Out of Stock",body:"Interior · Reorder immediately",link:{module:"inventory",label:"View Inventory"},ts:"Today 07:01",read:false,_key:"demo_4"},
      {id:"demo_8",cat:"task",dept:"Interior",title:"📋 Task Due Today: Cabin Turnover — Guest 4",body:"Chief Stewardess · High priority",link:{module:"tasks",label:"View Task"},ts:"Today 09:00",read:false,_key:"demo_8"},
    ],
    chef: [
      {id:"demo_3",cat:"inventory",dept:"Galley",title:"📦 Low Stock: Olive Oil",body:"2 litres remaining · Reorder level: 5",link:{module:"inventory",label:"View Inventory"},ts:"Today 07:01",read:false,_key:"demo_3"},
    ],
  };
  const [allNotifications, setAllNotifications] = useState(DEMO_NOTIFS_BY_ROLE);
  // Each role reads and writes only its own slice — clearing is fully independent
  const notifications    = allNotifications[role] || [];
  const setNotifications = (updater) => setAllNotifications(prev=>({
    ...prev,
    [role]: typeof updater==="function" ? updater(prev[role]||[]) : updater,
  }));
  const [showNotifCentre, setShowNotifCentre] = useState(false);


  // ── Notification engine — connects all modules ──────────────
  useNotificationEngine({
    tasks, crew, docs, assets, jobs, inventory,
    calEntries, leaveRequests, notifications, setNotifications, role,
  });

  const [guests,setGuests] = useState([
    {id:"g1",name:"Ahmed Al Maktoum",type:"Owner",nationality:"UAE",dietary:"No restrictions",allergies:"None",drinks:"Champagne — Krug, Single malt Scotch",notes:"Prefers Molton Brown. Extra pillows.",trips:[]},
    {id:"g2",name:"James Worthington",type:"Charter Guest",nationality:"British",dietary:"Vegetarian",allergies:"Shellfish — severe",drinks:"Sauvignon Blanc, Gin & Tonic",notes:"Previous charter Jun 2025.",trips:[]},
    {id:"g3",name:"Sophie Laurent",type:"Charter Guest",nationality:"French",dietary:"Gluten-free",allergies:"Gluten — coeliac",drinks:"Rosé wine, Champagne",notes:"Strict gluten-free. Separate prep surfaces required.",trips:[]},
  ]);

  function logAudit(action,detail,module="General") {
    const entry={
      id:Date.now(),
      timestamp:new Date().toLocaleString("en-AE",{dateStyle:"short",timeStyle:"short"}),
      user:user.name, role:ri.label, module, action, detail,
    };
    setAuditLog(p=>[entry,...p].slice(0,200)); // keep last 200
  }

  const myTasks=["management","captain"].includes(role)?tasks:tasks.filter(t=>t.assignedTo===role);
  const overdue=myTasks.filter(t=>t.status==="Overdue");
  const awaiting=tasks.filter(t=>t.status==="Awaiting Approval");
  const docAlerts=docs.filter(d=>["Expired","Expiring Soon"].includes(d.status));
  const crewDocAlerts=crew.flatMap(c=>c.docs.filter(d=>["Expired","Expiring Soon"].includes(d.status)));
  const totalDocAlerts=docAlerts.length+crewDocAlerts.length;

  const isMobile = window.innerWidth < 768;
  // Role-specific bottom nav — tailored to daily use per role/position
  const mobileNavByRole = {
    captain:    ["dashboard","tasks","hours","crew","leave"],
    management: ["dashboard","tasks","hours","crew","documents"],
    owner:      ["dashboard","calendar","weather","crew","ai"],
    engineer:   ["dashboard","tasks","maintenance","hours","leave"],
    stew:       ["dashboard","tasks","inventory","hours","leave"],
    chef:       ["dashboard","tasks","inventory","hours","leave"],
    deckhand:   ["dashboard","tasks","weather","hours","leave"],
    agent:      ["dashboard","weather"],
  };
  // For officers, derive from position stored in crew record
  const myPosition = crew.find(c=>c.id===user.id)?.position||"";
  const officerPositions = ["First Officer","Chief Officer","Second Officer","Third Officer"];
  const isOfficer = officerPositions.includes(myPosition);
  const navKey = isOfficer ? "captain" : role;
  const roleNavIds = mobileNavByRole[navKey] || ["dashboard","tasks","maintenance","inventory","weather"];
  const mobileNav = roleNavIds.map(id=>NAV.find(n=>n.id===id)).filter(Boolean).filter(n=>navVisible(n.id,role));

  return <div style={{display:"flex",height:"100dvh",maxHeight:"100dvh",overflow:"hidden",background:C.bg,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",color:C.text,fontSize:14}}>

    {/* MOBILE — hamburger top bar */}
    {isMobile&&<>
      {/* Top bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:C.navy,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"10px 14px",gap:10}}>
        <button onClick={()=>setCollapsed(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Menu size={22} color="rgba(255,255,255,0.9)" strokeWidth={1.8}/>
        </button>
        <div style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${C.brass}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Anchor size={13} color={C.brass} strokeWidth={2}/></div>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:13,color:C.white,letterSpacing:2,fontFamily:"Georgia,serif"}}>BRIDGE</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {/* Notification bell — Captain + crew roles */}
          {["captain","engineer","stew","deckhand","chef"].includes(role)&&<button onClick={()=>setShowNotifCentre(true)} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4,flexShrink:0}}>
            <Bell size={20} color="rgba(255,255,255,0.9)" strokeWidth={1.8}/>
            {notifications.filter(n=>!n.read).length>0&&<span style={{position:"absolute",top:0,right:0,background:C.signal,color:"#fff",borderRadius:10,fontSize:9,fontWeight:800,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>
              {notifications.filter(n=>!n.read).length>9?"9+":notifications.filter(n=>!n.read).length}
            </span>}
          </button>}
          <div style={{width:22,height:22,borderRadius:"50%",background:`${ri.color}22`,border:`1px solid ${ri.color}55`,display:"flex",alignItems:"center",justifyContent:"center"}}><RoleIcon role={role} size={13} color={ri.color}/></div>
          <span style={{fontSize:10,color:C.muted}}>{user.name}</span>
        </div>
      </div>
      {/* Slide-out drawer overlay */}
      {!collapsed&&<div style={{position:"fixed",inset:0,zIndex:200}} onClick={()=>setCollapsed(true)}>
        <div style={{position:"absolute",inset:0,background:"rgba(7,16,31,.7)"}}/>
        <div style={{position:"absolute",top:0,left:0,bottom:0,width:240,background:C.navy,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          {/* Drawer header */}
          <div style={{padding:"14px 14px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${C.brass}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Anchor size={14} color={C.brass} strokeWidth={2}/></div>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:14,color:C.white,letterSpacing:2,fontFamily:"Georgia,serif"}}>BRIDGE</div>
              <div style={{fontSize:7,color:C.brass,letterSpacing:1.5,textTransform:"uppercase"}}>Yacht Operations</div>
            </div>
            <button onClick={()=>setCollapsed(true)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,padding:0}}>×</button>
          </div>
          {/* Role switcher */}
          <div style={{padding:"8px 12px 10px",borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Logged in as</div>
            <select value={user.id} onChange={e=>{const u=dynamicUsers.find(u=>u.id===e.target.value);if(u){setUser(u);setView("dashboard");setInitFilter(null);setCrewFilter(null);setDocFilter(null);setCollapsed(true);}}}
              style={{background:"rgba(255,255,255,0.1)",border:`1px solid rgba(255,255,255,0.2)`,color:C.white,borderRadius:6,padding:"5px 8px",fontSize:11,width:"100%"}}>
              {dynamicUsers.map(u=><option key={u.id} value={u.id}>{u.name}{u.position&&u.position!==u.name?` (${u.position})`:''}</option>)}
            </select>
            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:`${ri.color}33`,border:`2px solid ${ri.color}77`,display:"flex",alignItems:"center",justifyContent:"center"}}><RoleIcon role={role} size={13} color={ri.color}/></div>
              <div>
                <div style={{fontSize:11,color:C.white,fontWeight:600}}>{ri.label}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>{PERMS[role]?.readOnly?"Read-only":PERMS[role]?.canAssignTasks?"Full access":"Task access"}</div>
              </div>
            </div>
          </div>
          {/* Nav items */}
          <nav style={{padding:"6px 0",flex:1}}>
            {NAV.filter(n=>navVisible(n.id,role)).map(n=>{
              const alerts=n.id==="tasks"?(overdue.length+awaiting.length):n.id==="documents"?totalDocAlerts:n.id==="crew"?crewDocAlerts.length:0;
              return <button key={n.id} onClick={()=>{setView(n.id);setCollapsed(true);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:view===n.id?"rgba(255,255,255,0.12)":"transparent",border:"none",borderLeft:view===n.id?`3px solid ${C.brassL}`:"3px solid transparent",color:view===n.id?"#ffffff":"rgba(255,255,255,0.75)",cursor:"pointer",fontSize:13,textAlign:"left",fontWeight:view===n.id?700:400}}>
                <NavIcon id={n.id} size={18} color={view===n.id?"#ffffff":"rgba(255,255,255,0.75)"}/>
                <span style={{flex:1}}>{n.label}</span>
                {alerts>0&&<span style={{background:n.id==="tasks"?C.signal:C.amber,color:"white",borderRadius:10,fontSize:9,padding:"1px 6px",fontWeight:700}}>{alerts}</span>}
              </button>;
            })}
          </nav>
          <div style={{padding:"10px 14px",borderTop:`1px solid rgba(255,255,255,0.1)`,textAlign:"center"}}>
            <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",letterSpacing:1.2,textTransform:"uppercase",lineHeight:1.7}}>Bridging every deck,<br/>every duty, every day.</div>
          </div>
        </div>
      </div>}
    </>}

    {/* DESKTOP SIDEBAR */}
    {!isMobile&&<div style={{
      width:collapsed?58:210,
      background:C.navy,
      borderRight:`1px solid ${C.border}`,
      display:"flex",flexDirection:"column",flexShrink:0,
      transition:"width .18s ease",overflow:"hidden",height:"100dvh",
    }}>
      <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${C.brass}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{"⚓"}</div>
        {!collapsed&&<div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:14,color:C.white,letterSpacing:2,fontFamily:"Georgia,serif"}}>{"BRIDGE"}</div>
          <div style={{fontSize:7,color:C.brass,letterSpacing:1.5,textTransform:"uppercase"}}>{"Yacht Operations"}</div>
        </div>}
        {/* Notification bell — Captain + crew roles */}
        {["captain","engineer","stew","deckhand","chef"].includes(role)&&<button onClick={()=>setShowNotifCentre(true)} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4,flexShrink:0}}>
          <Bell size={20} color="rgba(255,255,255,0.9)" strokeWidth={1.8}/>
          {notifications.filter(n=>!n.read).length>0&&<span style={{position:"absolute",top:0,right:0,background:C.signal,color:"#fff",borderRadius:10,fontSize:8,fontWeight:800,minWidth:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>
            {notifications.filter(n=>!n.read).length>9?"9+":notifications.filter(n=>!n.read).length}
          </span>}
        </button>}
        {/* Hamburger */}
        <button onClick={()=>setCollapsed(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",flexShrink:0,padding:4,marginLeft:collapsed?"auto":0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Menu size={20} color="rgba(255,255,255,0.85)" strokeWidth={1.8}/>
        </button>
      </div>

      {!collapsed&&<div style={{padding:"8px 12px 10px",borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Logged in as</div>
        <select value={user.id} onChange={e=>{const u=dynamicUsers.find(u=>u.id===e.target.value);if(u){setUser(u);setView("dashboard");setInitFilter(null);setCrewFilter(null);setDocFilter(null);}}}
          style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:C.white,borderRadius:6,padding:"5px 8px",fontSize:11,width:"100%"}}>
          {dynamicUsers.map(u=><option key={u.id} value={u.id}>{u.name}{u.position&&u.position!==u.name?` (${u.position})`:''}</option>)}
        </select>
        <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${ri.color}33`,border:`2px solid ${ri.color}77`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><RoleIcon role={role} size={14} color={ri.color}/></div>
          <div>
            <div style={{fontSize:11,color:C.white,fontWeight:600}}>{ri.label}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>{PERMS[role]?.readOnly?"Read-only access":PERMS[role]?.canAssignTasks?"Full access":"Task access only"}</div>
          </div>
        </div>
      </div>}

      <nav style={{padding:"6px 0",flex:1}}>
        {NAV.filter(n=>navVisible(n.id,role)).map(n=>{
          const mAlerts=assets.filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a))).length+jobs.filter(j=>j.status!=="Done"&&j.status!=="Cancelled"&&j.priority==="Critical").length;
          const invAlerts=inventory.filter(i=>i.minQty>0&&i.qty<i.minQty).length;
          const driveAlerts=totalDocAlerts+crewDocAlerts.length;
          const weatherAlerts=0;
          const pendingEnquiries = enquiries.filter(e=>e.status==="Pending").length;
          const pendingLeave     = leaveRequests.filter(r=>r.status==="pending").length;
          const alerts=
            n.id==="tasks"?(overdue.length+awaiting.length):
            n.id==="maintenance"?mAlerts:
            n.id==="inventory"?invAlerts:
            n.id==="weather"?weatherAlerts:
            n.id==="drive"?driveAlerts:
            n.id==="documents"?totalDocAlerts:
            n.id==="crew"?crewDocAlerts.length:
            n.id==="leave"?pendingLeave:
            n.id==="calendar"?pendingEnquiries:0;
          return <button key={n.id} onClick={()=>setView(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",background:view===n.id?"rgba(255,255,255,0.12)":"transparent",border:"none",borderLeft:view===n.id?`3px solid ${C.brassL}`:"3px solid transparent",color:view===n.id?"#ffffff":"rgba(255,255,255,0.75)",cursor:"pointer",fontSize:13,textAlign:"left",fontWeight:view===n.id?700:400,whiteSpace:"nowrap",overflow:"hidden"}}>
            <NavIcon id={n.id} size={17} color={view===n.id?"#ffffff":"rgba(255,255,255,0.75)"}/>
            {!collapsed&&<><span style={{flex:1}}>{n.label}</span>
            {alerts>0&&<span style={{background:alerts>0?(n.id==="tasks"?C.signal:C.amber):C.muted,color:"white",borderRadius:10,fontSize:9,padding:"1px 6px",fontWeight:700,flexShrink:0}}>{alerts}</span>}
            </>}
          </button>;
        })}
      </nav>

      {!collapsed&&<div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
        <div style={{opacity:.3}}><Ico i={Compass} s={20} c={C.muted}/></div>
        <div style={{fontSize:7,color:C.muted,letterSpacing:1.2,textTransform:"uppercase",marginTop:2,lineHeight:1.7}}>Bridging every deck,<br/>every duty, every day.</div>
      </div>}
    </div>}

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",height:"100dvh",padding:isMobile?"52px 14px 80px":"20px 24px 40px",minWidth:0,width:"100%",WebkitOverflowScrolling:"touch",touchAction:"pan-y"}}>
      {view==="dashboard" &&(role==="agent"
        ?<AgentDashboard showToast={showToast} vesselRegistry={vesselRegistry} enquiries={enquiries} setEnquiries={setEnquiries} role={role}/>
        :<Dashboard tasks={tasks} crew={crew} setCrew={setCrew} docs={docs} assets={assets} inventory={inventory} calEntries={calEntries} role={role} setView={setView} setInitFilter={setInitFilter} setCrewFilter={setCrewFilter} setDocFilter={setDocFilter} vesselRegistry={vesselRegistry} setInitCalView={setInitCalView}/>)}
      {view==="tasks"     &&<TaskModule tasks={tasks} setTasks={setTasks} crew={crew} role={role} user={user} initFilter={initFilter} clearFilter={()=>setInitFilter(null)} logAudit={logAudit} showToast={showToast}/>}
      {view==="maintenance"&&(hasNav(role,"maintenance")?<MaintenanceModule assets={assets} setAssets={setAssets} jobs={jobs} setJobs={setJobs} role={role} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="crew"      &&(hasNav(role,"crew")?<CrewModule crew={crew} setCrew={setCrew} role={role} showToast={showToast} initFilter={crewFilter} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="leave"     &&(hasNav(role,"leave")?<LeaveModule leaveRequests={leaveRequests} setLeaveRequests={setLeaveRequests} role={role} crew={crew} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="hours"     &&(hasNav(role,"hours")?<HoursModule hoursLog={hoursLog} setHoursLog={setHoursLog} role={role} crew={crew} vesselRegistry={vesselRegistry} leaveRequests={leaveRequests} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="documents" &&(hasNav(role,"documents")?<DocumentsModule docs={docs} setDocs={setDocs} role={role} initFilter={docFilter} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="inventory" &&(hasNav(role,"inventory")?<InventoryModule inventory={inventory} setInventory={setInventory} role={role} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="logbook"   &&(hasNav(role,"logbook")?<LogbookModule logbook={logbook} setLogbook={setLogbook} role={role} logAudit={logAudit} liveWeather={liveWeather}/>:<AccessDenied/>)}
      {view==="calendar"  &&(hasNav(role,"calendar")?<CalendarModule calEntries={calEntries} setCalEntries={setCalEntries} role={role} logAudit={logAudit} enquiries={enquiries} setEnquiries={setEnquiries} notifications={notifications} setNotifications={setNotifications} vesselRegistry={vesselRegistry} setVesselRegistry={setVesselRegistry} leaveRequests={leaveRequests} tasks={tasks} setTasks={setTasks} setView={setView} initCalView={initCalView} clearInitCalView={()=>setInitCalView(null)} showToast={showToast}/>:<AccessDenied/>)}
      {view==="weather"   &&(hasNav(role,"weather")?<WeatherModule logAudit={logAudit} setLiveWeather={setLiveWeather}/>:<AccessDenied/>)}
      {view==="drive"     &&(hasNav(role,"drive")?<DriveModule docs={docs} setDocs={setDocs} crew={crew} setCrew={setCrew} logAudit={logAudit} role={role}/>:<AccessDenied/>)}
      {view==="ai"        &&(hasNav(role,"ai")?<AIHub tasks={tasks} setTasks={setTasks} crew={crew} docs={docs} assets={assets} inventory={inventory} logbook={logbook} jobs={jobs} guests={guests} role={role} logAudit={logAudit}/>:<AccessDenied/>)}
      {view==="audit"     &&(hasNav(role,"audit")?<AuditModule auditLog={auditLog} role={role}/>:<AccessDenied/>)}
    </div>

    {/* MOBILE BOTTOM NAV */}
    {isMobile&&<div style={{position:"fixed",bottom:0,left:0,right:0,background:C.navy+"f8",backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"6px 0 10px",zIndex:50}}>
      {mobileNav.map(n=>{
        const mAlerts=n.id==="tasks"?(overdue.length+awaiting.length):
          n.id==="maintenance"?assets.filter(a=>["Overdue","Due Soon"].includes(assetServiceStatus(a))).length:
          n.id==="inventory"?inventory.filter(i=>i.minQty>0&&i.qty<i.minQty).length:
          n.id==="documents"?totalDocAlerts:
          n.id==="crew"?crewDocAlerts.length:0;
        return <button key={n.id} onClick={()=>setView(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0",position:"relative",flex:1}}>
          <NavIcon id={n.id} size={22} color={view===n.id?C.brassL:"rgba(255,255,255,0.7)"}/>
          <span style={{fontSize:9,color:view===n.id?C.brassL:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:.5,fontWeight:view===n.id?700:400,lineHeight:1.2}}>{n.label}</span>
          {view===n.id&&<div style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:C.brass,borderRadius:2}}/>}
          {mAlerts>0&&<div style={{position:"absolute",top:0,right:"10%",background:n.id==="tasks"?C.signal:C.amber,color:"white",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{mAlerts>9?"9+":mAlerts}</div>}
        </button>;
      })}
    </div>}

    {/* ── NOTIFICATION CENTRE — hidden for agent ── */}
    {showNotifCentre&&["captain","engineer","stew","deckhand","chef"].includes(role)&&<NotificationCentre
      notifications={notifications}
      setNotifications={setNotifications}
      setView={setView}
      onClose={()=>setShowNotifCentre(false)}
    />}
    <ToastContainer toasts={toasts}/>
  </div>;
}