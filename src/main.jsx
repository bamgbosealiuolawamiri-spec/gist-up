import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Compass, Users, MessageCircle, Bell, Bookmark, Settings, Plus, Search, Heart, MessageSquare, Repeat2, Send, Image as ImageIcon, Smile, Menu, X, ArrowRight, TrendingUp, MoreHorizontal, UserRound, ShieldCheck, SlidersHorizontal, Hash, Mail, Lock, Eye, EyeOff, ChevronRight, Check, Paperclip, SmilePlus, BarChart3, Megaphone, CircleHelp, LogOut, Globe2, Moon, Shield, Trash2, Archive, Ban, Camera, Pencil, Share2, Flame, Clock, UserPlus, FileText, BookOpen, Bot, ArrowUpRight, ArrowDownToLine, Video, Wallet, Coins, History, Gift } from "lucide-react";
import "./index.css";

const API_BASE = "https://gist-up-api.onrender.com";

const seedPosts = [
  { id: 1, name: "Maya Johnson", handle: "@mayaj", time: "18 min ago", initials: "MJ", tone: "lavender", text: "Small reminder: your progress doesn't have to look like anyone else's. Keep showing up for the things that matter to you. 💜", likes: 128, comments: 24, topic: "Lifestyle" },
  { id: 2, name: "Daniel Okafor", handle: "@dancreates", time: "42 min ago", initials: "DO", tone: "peach", text: "Working on a new creative project this week. What's one thing you're learning right now?", likes: 86, comments: 17, topic: "Creators" },
  { id: 3, name: "Aisha Bello", handle: "@aishab", time: "1 hr ago", initials: "AB", tone: "mint", text: "Today's little win: I finally finished the book that has been sitting on my desk for months. What are you celebrating today?", likes: 204, comments: 31, topic: "Community" }
];

const sidebarGroups = [
  { title: "DISCOVER", items: [
    { label: "Home", icon: Home }, { label: "Explore", icon: Compass }, { label: "Communities", icon: Users }
  ]},
  { title: "CONNECT", items: [
    { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Saved", icon: Bookmark }
  ]},
  { title: "GO LIVE", items: [
    { label: "Live", icon: Video }
  ]},
  { title: "YOUR WALLET", items: [
    { label: "Wallet", icon: Wallet }
  ]},
  { title: "CREATE", items: [
    { label: "Creator Studio", icon: FileText }, { label: "Image Studio", icon: ImageIcon }
  ]},
  { title: "MORE", items: [
    { label: "Gisty AI", icon: Bot }, { label: "Ads Manager", icon: Megaphone }, { label: "Settings & Privacy", icon: Settings }, { label: "Profile", display: "My profile", icon: UserRound }
  ]}
];
function Avatar({ initials, tone = "lavender", size = "", imageUrl = null }) { return <div className={"avatar " + tone + " " + size}>{imageUrl ? <img src={imageUrl} alt="" /> : initials}</div>; }
function VerifiedBadge({ size = 15 }) { return <span className="verified-badge" title="Verified account" aria-label="Verified account"><ShieldCheck size={size}/></span>; }
function App() {
  const [active, setActive] = useState("Home");
  const [liked, setLiked] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [myReplies, setMyReplies] = useState([]);
  const [reposted, setReposted] = useState([]);
  const [saved, setSaved] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("Reach");
  const [campaignBudget, setCampaignBudget] = useState("1000");
  const [campaignAudience, setCampaignAudience] = useState("");
  const [campaignBusy, setCampaignBusy] = useState(false);
  const [following, setFollowing] = useState([]);
  const [people, setPeople] = useState([]);
  const [feedMode, setFeedMode] = useState("for-you");
  const [followerCount, setFollowerCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [postBusy, setPostBusy] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImageData, setPostImageData] = useState("");
  const [postVideoData, setPostVideoData] = useState("");
  const [avatarImageData, setAvatarImageData] = useState("");
  const [coverImageData, setCoverImageData] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentPost, setCommentPost] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageUserResults, setMessageUserResults] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);
  const [settingsTab, setSettingsTab] = useState("Account");
  const [authMode, setAuthMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileTab, setProfileTab] = useState("Posts");
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioImageUrl, setStudioImageUrl] = useState("");
  const [studioBusy, setStudioBusy] = useState(false);
  const [studioError, setStudioError] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantImageMode, setAssistantImageMode] = useState(false);
  const [assistantStudyMode, setAssistantStudyMode] = useState(false);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState("unknown");
  const [assistantModel, setAssistantModel] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveBirthDate, setLiveBirthDate] = useState("");
  const [liveRulesAccepted, setLiveRulesAccepted] = useState(false);
  const [liveEligibility, setLiveEligibility] = useState(null);
  const [liveEligibilityBusy, setLiveEligibilityBusy] = useState(false);
  const [liveEligibilityError, setLiveEligibilityError] = useState("");
  const [publicRooms, setPublicRooms] = useState([]);
  const [publicRoom, setPublicRoom] = useState(null);
  const [publicRole, setPublicRole] = useState("");
  const [publicViewers, setPublicViewers] = useState([]);
  const [publicMessages, setPublicMessages] = useState([]);
  const [publicMessageText, setPublicMessageText] = useState("");
  const [publicError, setPublicError] = useState("");
  const [publicRemoteStream, setPublicRemoteStream] = useState(null);
  const [publicCommentsEnabled, setPublicCommentsEnabled] = useState(true);
  const [publicLikesCount, setPublicLikesCount] = useState(0);
  const [publicLikePulse, setPublicLikePulse] = useState(0);
  const lastPublicTapRef = useRef(0);
  const publicPollRef = useRef(null);
  const publicPeerRef = useRef(new Map());
  const publicSignalCursorRef = useRef(0);
  const publicMessageCursorRef = useRef(0);
  const publicPollBusyRef = useRef(false);

  const [liveStream, setLiveStream] = useState(null);
  const [liveCameraBusy, setLiveCameraBusy] = useState(false);
  const [liveCameraError, setLiveCameraError] = useState("");
  const [liveInviteCode, setLiveInviteCode] = useState("");
  const [liveJoinCode, setLiveJoinCode] = useState("");
  const [liveSession, setLiveSession] = useState(null);
  const [liveRole, setLiveRole] = useState("");
  const [liveStatus, setLiveStatus] = useState("idle");
  const [liveParticipants, setLiveParticipants] = useState([]);
  const [liveRemoteStreams, setLiveRemoteStreams] = useState({});
  const [battleState, setBattleState] = useState(null);
  const [battleBusy, setBattleBusy] = useState(false);
  const [battleError, setBattleError] = useState("");
  const [battleGifts, setBattleGifts] = useState([]);
  const [recentBattleGifts, setRecentBattleGifts] = useState([]);

  useEffect(() => {
    if (!authUser?.id) { setLiveEligibility(null); return; }
    fetch(API_BASE + "/api/live/eligibility", { credentials: "include" })
      .then(async r => { const d = await r.json().catch(() => ({})); if (r.ok) setLiveEligibility(d.eligibility || null); })
      .catch(() => {});
  }, [authUser?.id]);
  useEffect(() => {
    if (active !== "Live" || publicRoom) return;
    let alive = true;
    const load = () => fetch(API_BASE + "/api/public-live", { credentials: "include" })
      .then(async r => { const d = await r.json().catch(() => ({})); if (alive && r.ok) setPublicRooms(d.rooms || []); }).catch(() => {});
    load(); const timer = setInterval(load, 10000);
    return () => { alive = false; clearInterval(timer); };
  }, [active, publicRoom?.id]);
  useEffect(() => () => {
    if (publicPollRef.current) clearInterval(publicPollRef.current);
    publicPeerRef.current.forEach(pc => pc.close()); publicPeerRef.current.clear();
  }, []);
  const [liveMuted, setLiveMuted] = useState(false);
  const [liveCameraOff, setLiveCameraOff] = useState(false);
  const peerConnectionsRef = useRef(new Map());
  const pollTimerRef = useRef(null);
  const signalCursorRef = useRef(0);
  const pendingIceRef = useRef(new Map());
  const livePollBusyRef = useRef(false);
  useEffect(() => () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    liveStream?.getTracks().forEach(track => track.stop());
  }, [liveStream]);

  const [verificationApplication, setVerificationApplication] = useState(null);
  const [verificationReason, setVerificationReason] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [verificationQueueBusy, setVerificationQueueBusy] = useState(false);
  const isVerificationAdmin = String(authUser?.email || "").toLowerCase() === "gistup.admin@gmail.com";
  useEffect(() => {
    if (!authUser?.id) { setVerificationApplication(null); setVerificationQueue([]); return; }
    fetch(API_BASE + "/api/verification/me", { credentials: "include" })
      .then(response => response.ok ? response.json() : null)
      .then(data => setVerificationApplication(data?.application || null))
      .catch(() => {});
  }, [authUser?.id]);
  useEffect(() => {
    if (settingsTab !== "Verification review" || !isVerificationAdmin) return;
    setVerificationQueueBusy(true);
    fetch(API_BASE + "/api/admin/verification", { credentials: "include" })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Couldn't load the review queue.");
        setVerificationQueue(data.applications || []);
      })
      .catch(error => notify(error.message))
      .finally(() => setVerificationQueueBusy(false));
  }, [settingsTab, isVerificationAdmin]);
  async function submitVerificationApplication() {
    setVerificationBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/verification/applications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: verificationReason, publicLinks: verificationLink })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't submit your application.");
      setVerificationApplication(data.application);
      setVerificationReason(""); setVerificationLink("");
      notify("Your verification application has been submitted.");
    } catch (error) { notify(error.message || "Couldn't submit your application."); }
    finally { setVerificationBusy(false); }
  }
  async function reviewVerificationApplication(id, status) {
    const prompts = { rejected: "Enter a brief reason for rejecting this application:", revoked: "Enter the reason for removing this verified badge:" };
    const reviewerNote = prompts[status] ? window.prompt(prompts[status]) : "";
    if (prompts[status] && (reviewerNote === null || !reviewerNote.trim())) return;
    try {
      const response = await fetch(API_BASE + "/api/admin/verification/" + encodeURIComponent(id), {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerNote: reviewerNote || "" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't save this decision.");
      setVerificationQueue(items => items.map(item => String(item.id) === String(id) ? { ...item, status, is_verified: status === "approved", reviewer_note: reviewerNote || "" } : item));
      notify(status === "approved" ? "Application approved." : status === "revoked" ? "Verified badge removed." : "Application rejected.");
    } catch (error) { notify(error.message || "Couldn't save this decision."); }
  }

  useEffect(() => {
    if (!authUser?.id) { setAssistantMessages([]); return; }
    try { const savedChat = JSON.parse(localStorage.getItem("gistup:gisty-chat:" + authUser.id) || "[]"); setAssistantMessages(Array.isArray(savedChat) ? savedChat.slice(-40) : []); }
    catch { setAssistantMessages([]); }
  }, [authUser?.id]);
  function saveGistyMessages(messages) {
    if (!authUser?.id) return;
    try { const safeMessages = messages.slice(-40).map(({ role, content, imageUrl }) => ({ role, content, ...(imageUrl && imageUrl.length < 120000 ? { imageUrl } : {}) })); localStorage.setItem("gistup:gisty-chat:" + authUser.id, JSON.stringify(safeMessages)); }
    catch { try { localStorage.setItem("gistup:gisty-chat:" + authUser.id, JSON.stringify(messages.slice(-20).filter(item => !item.imageUrl).map(({ role, content }) => ({ role, content })))); } catch {} }
  }
  function startNewGistyChat() { setAssistantMessages([]); if (authUser?.id) { try { localStorage.removeItem("gistup:gisty-chat:" + authUser.id); } catch {} } }
  const [communityJoined, setCommunityJoined] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communityFormOpen, setCommunityFormOpen] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityBusy, setCommunityBusy] = useState(false);
  const [blocked, setBlocked] = useState([]);
  const [profileBio, setProfileBio] = useState("Your story starts here. Add a bio and let people get to know you.");
  const [editProfile, setEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState("Your profile");
  const [handle, setHandle] = useState("@yourprofile");
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({ darkMode: false, notificationsFollowers: true, notificationsEngagement: true, notificationsMessages: true, notificationsCommunities: true });
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  async function loadAppData(fallbackUser = null) {
    try {
      const [profileResponse, postsResponse, usersResponse, followingResponse, blocksResponse, savedResponse, notificationsResponse, campaignsResponse, likesResponse, communitiesResponse, settingsResponse, repliesResponse] = await Promise.all([
        fetch(API_BASE + "/api/profile/me", { credentials: "include" }),
        fetch(API_BASE + "/api/posts?feed=" + encodeURIComponent(feedMode), { credentials: "include" }),
        fetch(API_BASE + "/api/users", { credentials: "include" }),
        fetch(API_BASE + "/api/follows/me", { credentials: "include" }),
        fetch(API_BASE + "/api/blocks/me", { credentials: "include" }),
        fetch(API_BASE + "/api/saved", { credentials: "include" }),
        fetch(API_BASE + "/api/notifications", { credentials: "include" }),
        fetch(API_BASE + "/api/ads/campaigns", { credentials: "include" }),
        fetch(API_BASE + "/api/likes/me", { credentials: "include" }),
        fetch(API_BASE + "/api/communities", { credentials: "include" }),
        fetch(API_BASE + "/api/settings", { credentials: "include" }),
        fetch(API_BASE + "/api/comments/me", { credentials: "include" })
      ]);
      let user = fallbackUser;
      if (profileResponse.ok) {
        const data = await profileResponse.json();
        user = data.profile || user;
        setFollowerCount(Number(data.followersCount || 0));
      }
      if (user) {
        setAuthUser(user);
        setDisplayName(user.full_name || user.email?.split("@")[0] || "Your profile");
        setHandle("@" + (user.username || user.email?.split("@")[0] || "member"));
        setProfileBio(user.bio || "");
      }
      if (usersResponse.ok) {
        const userData = await usersResponse.json().catch(() => ({}));
        const mapped = (Array.isArray(userData.users) ? userData.users : []).map((person, index) => ({
          id: person.id,
          name: person.full_name,
          handle: "@" + person.username,
          avatar_url: person.avatar_url || null,
          initials: String(person.full_name || person.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
          tone: ["lavender", "mint", "peach"][index % 3],
          bio: person.bio || "Getting started on Gist Up.",
          isFollowing: person.is_following === true,
          is_verified: person.is_verified === true,
          followersCount: Number(person.followers_count || 0)
        }));
        setPeople(mapped);
        setFollowing(mapped.filter(person => person.isFollowing).map(person => person.handle));
      }
      if (followingResponse.ok) {
        const followingData = await followingResponse.json().catch(() => ({}));
        const handles = (Array.isArray(followingData.users) ? followingData.users : []).map(person => "@" + person.username);
        setFollowing(handles);
      }
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json().catch(() => ({}));
        const mappedBlocks = (Array.isArray(blocksData.users) ? blocksData.users : []).map((person, index) => ({
          id: person.id, name: person.full_name, handle: "@" + person.username, avatar_url: person.avatar_url || null,
          initials: String(person.full_name || person.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
          tone: ["lavender", "mint", "peach"][index % 3], bio: person.bio || ""
        }));
        setBlocked(mappedBlocks);
      }
      if (postsResponse.ok) {
        const data = await postsResponse.json();
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setLiked(Array.isArray(data.posts) ? data.posts.filter(post => post.isLiked).map(post => post.id) : []);
        setReposted(Array.isArray(data.posts) ? data.posts.filter(post => post.isReposted).map(post => post.id) : []);
      } else if (postsResponse.status !== 401) {
        notify("We couldn't load posts right now.");
      }
      if (savedResponse.ok) {
        const savedData = await savedResponse.json().catch(() => ({}));
        const items = Array.isArray(savedData.posts) ? savedData.posts : [];
        setSavedPosts(items);
        setSaved(items.map(post => post.id));
      }
      if (likesResponse.ok) {
        const likesData = await likesResponse.json().catch(() => ({}));
        const items = Array.isArray(likesData.posts) ? likesData.posts : [];
        setLikedPosts(items);
        setLiked(items.map(post => post.id));
      }
      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json().catch(() => ({}));
        setMyReplies(Array.isArray(repliesData.replies) ? repliesData.replies : []);
      }
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json().catch(() => ({}));
        setNotifications(Array.isArray(notificationsData.notifications) ? notificationsData.notifications : []);
      }
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json().catch(() => ({}));
        setCampaigns(Array.isArray(campaignsData.campaigns) ? campaignsData.campaigns : []);
      }
      if (communitiesResponse.ok) {
        const communityData = await communitiesResponse.json().catch(() => ({}));
        const items = Array.isArray(communityData.communities) ? communityData.communities : [];
        setCommunities(items);
        setCommunityJoined(items.filter(item => item.is_member).map(item => String(item.id)));
      }
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json().catch(() => ({}));
        const loadedSettings = { darkMode: false, notificationsFollowers: true, notificationsEngagement: true, notificationsMessages: true, notificationsCommunities: true, ...(settingsData.settings || {}) };
        setSettings(loadedSettings);
        setDarkMode(loadedSettings.darkMode === true);
        document.body.classList.toggle("dark-preview", loadedSettings.darkMode === true);
      }
    } catch {
      notify("Couldn't refresh your profile and feed. Please try again.");
    }
  }

  useEffect(() => {
    let mounted = true;
    fetch(API_BASE + "/api/auth/me", { credentials: "include" })
      .then(async response => response.ok ? (await response.json()).user : null)
      .then(async user => {
        if (!mounted || !user) return;
        setAuthUser(user);
        setAuthMode("app");
        await loadAppData(user);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);


  useEffect(() => {
    if (authUser && active === "Messages") loadConversations();
  }, [authUser, active, showArchived]);

  useEffect(() => {
    if (!authUser || active !== "Messages" || !activeConversationId) return;
    loadThread(activeConversationId);
    const timer = window.setInterval(() => loadThread(activeConversationId), 5000);
    return () => window.clearInterval(timer);
  }, [authUser, active, activeConversationId]);

  useEffect(() => {
    if (!showNewMessage) { setMessageUserResults([]); return; }
    const timer = window.setTimeout(() => searchMessageUsers(messageSearch), 250);
    return () => window.clearTimeout(timer);
  }, [showNewMessage, messageSearch]);

  async function submitAuth() {
    setAuthError("");
    if (!email.trim() || !password) { setAuthError("Enter your email address and password."); return; }
    if (authMode === "signup" && !fullName.trim()) { setAuthError("Enter your full name."); return; }
    if (password.length < 8) { setAuthError("Your password must be at least 8 characters."); return; }
    setAuthBusy(true);
    setAuthError("Connecting to Gist Up account service…");
    try {
      const response = await fetch(API_BASE + (authMode === "signup" ? "/api/auth/signup" : "/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't complete sign-in. Please try again.");
      const user = result.user;
      if (!user) throw new Error("The account service returned an invalid response. Please try again.");
      setAuthUser(user);
      setDisplayName(user.full_name || user.email?.split("@")[0] || "Your profile");
      setHandle("@" + (user.username || user.email?.split("@")[0] || "member"));
      setAuthMode("app");
      setAuthError("");
      await loadAppData(user);
      notify(authMode === "signup" ? "Welcome to Gist Up! Your account is ready." : "You're logged in.");
    } catch (error) {
      setAuthError(error?.message || "We couldn't complete sign-in. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      await fetch(API_BASE + "/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setAuthUser(null);
    setAuthMode("welcome");
    setPassword("");
    notify("You've signed out.");
  }

  function notify(message) { setNotice(message); window.setTimeout(() => setNotice(""), 3200); }
  async function prepareImage(file, maxDimension = 1200, quality = 0.82) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Choose an image file.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Choose an image smaller than 8 MB.");
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("We couldn't read that image.")); img.src = objectUrl; });
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length > 950000) throw new Error("That image is still too large. Choose a smaller image.");
      return data;
    } finally { URL.revokeObjectURL(objectUrl); }
  }
  async function handleImagePick(event, target) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    try { const data = await prepareImage(file, target === "post" ? 1280 : 1000, target === "post" ? 0.78 : 0.84); if (target === "post") { setPostImageData(data); setPostVideoData(""); } if (target === "avatar") setAvatarImageData(data); if (target === "cover") { setCoverImageData(data); setEditProfile(true); } }
    catch (error) { notify(error?.message || "Couldn't prepare that image."); }
  }
  async function handleVideoPick(event) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!["video/mp4", "video/webm"].includes(file.type)) { notify("Choose an MP4 or WebM video."); return; }
    if (file.size > 10 * 1024 * 1024) { notify("Choose a video smaller than 10 MB."); return; }
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("We couldn't read that video."));
        reader.readAsDataURL(file);
      });
      if (data.length > 14 * 1024 * 1024) throw new Error("That video is too large to upload. Choose a file under 10 MB.");
      setPostVideoData(data); setPostImageData("");
      notify("Video added to your post draft.");
    } catch (error) { notify(error?.message || "Couldn't prepare that video."); }
  }
  async function publish() {
    const content = postText.trim();
    if ((!content && !postImageData && !postVideoData) || postBusy) return;
    setPostBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl: postImageData || null, videoUrl: postVideoData || null })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't publish your post.");
      if (!result.post) throw new Error("The server didn't return the new post.");
      setPosts(current => [result.post, ...current]);
      setPostText("");
      setPostImageData("");
      setPostVideoData("");
      setComposerOpen(false);
      setActive("Home");
      notify("Your post was published.");
    } catch (error) {
      notify(error?.message || "We couldn't publish your post. Please try again.");
    } finally {
      setPostBusy(false);
    }
  }

  async function saveProfile() {
    const cleanHandle = handle.trim().replace(/^@+/, "");
    try {
      const response = await fetch(API_BASE + "/api/profile/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: displayName, username: cleanHandle, bio: profileBio, avatarUrl: avatarImageData || authUser?.avatar_url || null, coverUrl: coverImageData || authUser?.cover_url || null })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't save your profile.");
      if (!result.profile) throw new Error("The server didn't return the updated profile.");
      setAuthUser(result.profile);
      setDisplayName(result.profile.full_name);
      setHandle("@" + result.profile.username);
      setProfileBio(result.profile.bio || "");
      setAvatarImageData("");
      setCoverImageData("");
      setEditProfile(false);
      await loadAppData(result.profile);
      notify("Your profile has been saved.");
    } catch (error) {
      notify(error?.message || "We couldn't save your profile. Please try again.");
    }
  }
  function go(label) { if (label === "Profile") setSelectedProfile(null); setActive(label); setMobileNav(false); }
  async function openUserProfile(person) {
    if (!person?.id) { notify("This account profile isn't available."); return; }
    if (authUser && String(person.id) === String(authUser.id)) { setSelectedProfile(null); setActive("Profile"); setMobileNav(false); return; }
    try {
      const response = await fetch(API_BASE + "/api/users/" + encodeURIComponent(person.id) + "/profile", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.profile) throw new Error(result.error || "We couldn't open this profile.");
      const profile = result.profile;
      setSelectedProfile({
        id: profile.id,
        name: profile.full_name,
        handle: "@" + profile.username,
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || null,
        initials: String(profile.full_name || profile.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
        followersCount: Number(result.followersCount || 0),
        followingCount: Number(result.followingCount || 0),
        isFollowing: result.isFollowing === true,
        followsYou: result.followsYou === true,
        posts: Array.isArray(result.posts) ? result.posts : []
      });
      setActive("Profile");
      setMobileNav(false);
    } catch (error) {
      notify(error?.message || "We couldn't open this profile.");
    }
  }
  async function toggleLike(post) {
    const currentlyLiked = liked.includes(post.id);
    setLiked(old => currentlyLiked ? old.filter(id => id !== post.id) : [...old, post.id]);
    setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: Math.max(0, (item.likes || 0) + (currentlyLiked ? -1 : 1)) } : item));
    try {
      const response = await fetch(API_BASE + "/api/posts/" + post.id + "/like", { method: "POST", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update like.");
      setLiked(old => result.liked ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setLikedPosts(old => result.liked ? (old.some(item => item.id === post.id) ? old : [{ ...post, isLiked: true, likes: result.likes }, ...old]) : old.filter(item => item.id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: result.likes } : item));
    } catch (error) {
      setLiked(old => currentlyLiked ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, likes: Math.max(0, (item.likes || 0) + (currentlyLiked ? 1 : -1)) } : item));
      notify(error?.message || "Couldn't update like. Please try again.");
    }
  }
  async function openComments(postId) {
    setCommentPost(postId);
    setCommentText("");
    setPostComments([]);
    setCommentsBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + postId + "/comments", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't load comments.");
      setPostComments(Array.isArray(result.comments) ? result.comments : []);
    } catch (error) {
      notify(error?.message || "Couldn't load comments.");
    } finally {
      setCommentsBusy(false);
    }
  }
  async function submitComment() {
    const content = commentText.trim();
    if (!content || commentPost === null) return;
    try {
      const response = await fetch(API_BASE + "/api/posts/" + commentPost + "/comments", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't publish comment.");
      setPostComments(old => [...old, result.comment]);
      setPosts(old => old.map(item => item.id === commentPost ? { ...item, comments: (item.comments || 0) + 1 } : item));
      setCommentText("");
      notify("Comment published.");
    } catch (error) {
      notify(error?.message || "Couldn't publish comment.");
    }
  }
  async function toggleFollow(person) {
    if (!person.id) { notify("Only registered accounts can be followed."); return; }
    const wasFollowing = following.includes(person.handle);
    setFollowing(old => wasFollowing ? old.filter(x => x !== person.handle) : [...old, person.handle]);
    setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: !wasFollowing } : item));
    try {
      const response = await fetch(API_BASE + "/api/users/" + person.id + "/follow", { method: "POST", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update following.");
      setFollowing(old => result.following ? (old.includes(person.handle) ? old : [...old, person.handle]) : old.filter(x => x !== person.handle));
      setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: result.following, followersCount: result.followersCount } : item));
      setSelectedProfile(old => old && String(old.id) === String(person.id) ? { ...old, isFollowing: result.following, followersCount: Number(result.followersCount || 0) } : old);
      notify(result.following ? "You're now following this person." : "You unfollowed this person.");
      return true;
    } catch (error) {
      setFollowing(old => wasFollowing ? (old.includes(person.handle) ? old : [...old, person.handle]) : old.filter(x => x !== person.handle));
      setPeople(old => old.map(item => item.id === person.id ? { ...item, isFollowing: wasFollowing } : item));
      setSelectedProfile(old => old && String(old.id) === String(person.id) ? { ...old, isFollowing: wasFollowing } : old);
      notify(error?.message || "Couldn't update following.");
      return false;
    }
  }
  async function checkGistyAIStatus() {
    setAssistantStatus("checking");
    try {
      const response = await fetch(API_BASE + "/api/ai/status", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to check the AI connection.");
      setAssistantModel(result.model || "");
      setAssistantStatus(result.configured ? "ready" : "needs-key");
      if (!result.configured) notify("Gisty AI is using built-in starter mode; a provider key is not connected.");
      else notify("Gisty AI provider is configured: " + (result.provider || "AI") + ".");
    } catch (error) {
      setAssistantStatus("error");
      notify(error?.message || "Unable to check the AI connection.");
    }
  }
  function localGistyReply(prompt) {
    const lower = prompt.toLowerCase();
    if (/post idea|ideas for|content idea|what should i post/.test(lower)) {
      return "Gisty AI · Starter mode\n\nHere are 5 post ideas for Gist Up:\n\n1. Share one small win from this week.\n2. Tell a short story about something you learned.\n3. Ask your followers for a recommendation.\n4. Show a behind-the-scenes moment from a project you are working on.\n5. Ask a friendly question about a topic your community cares about.\n\nTip: add your own experience so the post feels personal.";
    }
    if (/caption|rewrite|improve|polish/.test(lower)) {
      const supplied = prompt.replace(/^(please\s+)?(improve|rewrite|polish)\s+(my\s+)?(caption\s*)?[:—-]?\s*/i, "").trim();
      if (supplied.length > 12) return "Gisty AI · Starter mode\n\nHere is a simple way to improve it: make the main point clear, add one specific detail, and finish with a question that invites replies.\n\nYour text: " + supplied;
      return "Gisty AI · Starter mode\n\nPaste the caption you want to improve, and I can help you make it clearer and more engaging.";
    }
    if (/hashtag|#tags?/.test(lower)) {
      const words = lower.match(/[a-z0-9]{4,}/g) || [];
      const ignored = new Set(["hashtags","suggest","please","about","using","with","give","make","some","post"]);
      const tags = [...new Set(words.filter(word => !ignored.has(word)))].slice(0,5);
      return "Gisty AI · Starter mode\n\nHashtag ideas: " + (tags.length ? tags.map(word => "#" + word).join(" ") : "#GistUp #YourStory #Community #DailyGist") + "\n\nUse only tags that genuinely match your post.";
    }
    if (/community|conversation topic|discussion topic/.test(lower)) {
      return "Gisty AI · Starter mode\n\nTry one of these community questions:\n\n1. What is something you are learning this month?\n2. What tool or resource would you recommend to others?\n3. What is one small win you are celebrating today?\n4. What do you wish more people understood about your interests?";
    }
    if (/bio|profile description/.test(lower)) {
      return "Gisty AI · Starter mode\n\nBio idea: “Sharing my projects, lessons, and everyday moments. Always learning and open to good conversations.”\n\nPersonalise it so it accurately describes you.";
    }
    return "Gisty AI · Starter mode\n\nI can help with post ideas, captions, hashtags, profile bios, and community discussion topics. Try: “Give me 5 post ideas for a new social app.”\n\nThe full AI provider is not responding right now, so this is a built-in starter reply.";
  }

  async function askGistyAI() {
    const rawPrompt = assistantPrompt.trim(); if (!rawPrompt || assistantBusy) return;
    if (assistantImageMode) { await generateGistyImage(rawPrompt); return; }
    const prompt = assistantStudyMode ? "You are Gisty Study Assistant, a patient learning coach for school students. Help the student understand rather than simply copy answers. Explain concepts in age-appropriate, clear steps; ask guiding questions when useful; show working for calculations; help brainstorm and structure essays without writing deceptive submissions; encourage the student to use their own words. If the student shares an assignment question, guide them through it and explain the reasoning.\n\nStudent question: " + rawPrompt : rawPrompt;
    const prior = assistantMessages.slice(-16).map(({ role, content }) => ({ role, content }));
    const nextMessages = [...prior, { role: "user", content: prompt }];
    setAssistantMessages(nextMessages); saveGistyMessages(nextMessages); setAssistantPrompt(""); setAssistantBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/ai/chat", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, messages: nextMessages }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Gisty AI couldn't respond right now.");
      const reply = String(result.reply || "").trim(); if (!reply) throw new Error("Gisty AI returned an empty reply.");
      const updatedMessages = [...nextMessages, { role: "assistant", content: reply }]; setAssistantMessages(updatedMessages); saveGistyMessages(updatedMessages); setAssistantReply(reply);
    } catch (error) { setAssistantMessages(current => { const updated = [...current, { role: "assistant", content: error?.message || "Gisty AI couldn't connect right now. Please try again." }]; saveGistyMessages(updated); return updated; }); }
    finally { setAssistantBusy(false); }
  }
  async function generateGistyImage(promptText = assistantPrompt.trim()) {
    const prompt = String(promptText || "").trim(); if (!prompt || assistantBusy) return;
    setAssistantMessages(current => { const updated = [...current, { role: "user", content: "Generate an image: " + prompt }]; saveGistyMessages(updated); return updated; });
    setAssistantPrompt(""); setAssistantBusy(true); setAssistantImageMode(true);
    try {
      const response = await fetch(API_BASE + "/api/ai/image", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Gisty AI couldn't generate an image right now.");
      if (!result.imageUrl) throw new Error("The image provider returned no image.");
      setAssistantMessages(current => { const updated = [...current, { role: "assistant", content: "Here's the image I generated for you.", imageUrl: result.imageUrl }]; saveGistyMessages(updated); return updated; });
    } catch (error) { setAssistantMessages(current => { const updated = [...current, { role: "assistant", content: error?.message || "Image generation is unavailable right now." }]; saveGistyMessages(updated); return updated; }); }
    finally { setAssistantBusy(false); }
  }

  async function useGistyImageInPost(imageUrl) {
    try {
      const response = await fetch(imageUrl); const blob = await response.blob();
      const file = new File([blob], "gisty-generated-image.png", { type: blob.type || "image/png" });
      const resized = await prepareImage(file, 1280, 0.78);
      setPostImageData(resized); setPostText(""); setComposerOpen(true); notify("Image added to your post draft. Add a caption and publish when ready.");
    } catch { notify("Couldn't prepare this image for a post. Download it and try uploading it from your device."); }
  }

  async function updateSetting(key, value) {
    const previous = settings[key];
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (key === "darkMode") {
      setDarkMode(value);
      document.body.classList.toggle("dark-preview", value);
    }
    setSettingsBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/settings", {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't save this setting.");
      setSettings(current => ({ ...current, ...(result.settings || {}) }));
      notify("Setting saved.");
    } catch (error) {
      setSettings(current => ({ ...current, [key]: previous }));
      if (key === "darkMode") {
        setDarkMode(previous === true);
        document.body.classList.toggle("dark-preview", previous === true);
      }
      notify(error?.message || "Couldn't save this setting.");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function updatePassword() {
    if (passwordBusy) return;
    if (newPassword.length < 8) { notify("Your new password must be at least 8 characters."); return; }
    if (newPassword !== confirmNewPassword) { notify("The new passwords don't match."); return; }
    setPasswordBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/auth/change-password", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update your password.");
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); setShowPasswordForm(false);
      notify("Password updated successfully.");
    } catch (error) {
      notify(error?.message || "Couldn't update your password.");
    } finally {
      setPasswordBusy(false);
    }
  }

  async function downloadAccountData() {
    try {
      const response = await fetch(API_BASE + "/api/account/export", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't export your information.");
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gist-up-account-data.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify("Your account data export is ready.");
    } catch (error) {
      notify(error?.message || "Couldn't export your information.");
    }
  }

  async function createCommunity() {
    if (communityBusy) return;
    setCommunityBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/communities", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: communityName.trim(), description: communityDescription.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't create community.");
      const item = result.community;
      setCommunities(old => [item, ...old.filter(existing => String(existing.id) !== String(item.id))]);
      setCommunityJoined(old => old.includes(String(item.id)) ? old : [...old, String(item.id)]);
      setCommunityName("");
      setCommunityDescription("");
      setCommunityFormOpen(false);
      notify("Community created.");
    } catch (error) {
      notify(error?.message || "Couldn't create community.");
    } finally {
      setCommunityBusy(false);
    }
  }

  async function toggleCommunityMembership(community) {
    const id = String(community.id);
    const wasJoined = communityJoined.includes(id);
    setCommunityJoined(old => wasJoined ? old.filter(value => value !== id) : [...old, id]);
    setCommunities(old => old.map(item => String(item.id) === id ? { ...item, is_member: !wasJoined, member_count: Math.max(0, Number(item.member_count || 0) + (wasJoined ? -1 : 1)) } : item));
    try {
      const response = await fetch(API_BASE + "/api/communities/" + encodeURIComponent(id) + "/join", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update membership.");
      setCommunityJoined(old => result.joined ? (old.includes(id) ? old : [...old, id]) : old.filter(value => value !== id));
      setCommunities(old => old.map(item => String(item.id) === id ? { ...item, is_member: result.joined, member_count: result.member_count } : item));
    } catch (error) {
      setCommunityJoined(old => wasJoined ? (old.includes(id) ? old : [...old, id]) : old.filter(value => value !== id));
      setCommunities(old => old.map(item => String(item.id) === id ? { ...item, is_member: wasJoined, member_count: Math.max(0, Number(item.member_count || 0) + (wasJoined ? 1 : -1)) } : item));
      notify(error?.message || "Couldn't update membership.");
    }
  }

  async function createCampaign() {
    const name = campaignName.trim();
    if (name.length < 3) { notify("Give your campaign a name of at least 3 characters."); return; }
    setCampaignBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/ads/campaigns", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal: campaignGoal, dailyBudget: Number(campaignBudget), audience: campaignAudience.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't save this campaign.");
      setCampaigns(old => [result.campaign, ...old]);
      setCampaignName("");
      setCampaignGoal("Reach");
      setCampaignBudget("1000");
      setCampaignAudience("");
      setCampaignModalOpen(false);
      notify("Campaign draft saved.");
    } catch (error) {
      notify(error?.message || "Couldn't save this campaign.");
    } finally {
      setCampaignBusy(false);
    }
  }
  async function submitReport() {
    if (!reportPost || reportBusy) return;
    setReportBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + reportPost.id + "/report", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't submit your report.");
      setReportPost(null);
      setReportDetails("");
      notify("Thanks. Your report has been sent for review.");
    } catch (error) {
      notify(error?.message || "Couldn't submit your report.");
    } finally {
      setReportBusy(false);
    }
  }
  async function toggleRepost(post) {
    const wasReposted = reposted.includes(post.id);
    setReposted(old => wasReposted ? old.filter(id => id !== post.id) : [...old, post.id]);
    setPosts(old => old.map(item => item.id === post.id ? { ...item, reposts: Math.max(0, (item.reposts || 0) + (wasReposted ? -1 : 1)) } : item));
    try {
      const response = await fetch(API_BASE + "/api/posts/" + post.id + "/repost", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reposted: !wasReposted })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update repost.");
      setReposted(old => result.reposted ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, reposts: result.reposts } : item));
      notify(result.reposted ? "Post reposted." : "Repost removed.");
    } catch (error) {
      setReposted(old => wasReposted ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setPosts(old => old.map(item => item.id === post.id ? { ...item, reposts: Math.max(0, (item.reposts || 0) + (wasReposted ? 1 : -1)) } : item));
      notify(error?.message || "Couldn't update repost.");
    }
  }
  async function toggleSave(post) {
    const wasSaved = saved.includes(post.id);
    setSaved(old => wasSaved ? old.filter(id => id !== post.id) : [...old, post.id]);
    setSavedPosts(old => wasSaved ? old.filter(item => item.id !== post.id) : [post, ...old.filter(item => item.id !== post.id)]);
    try {
      const response = await fetch(API_BASE + "/api/posts/" + post.id + "/save", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: !wasSaved })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update saved posts.");
      notify(result.saved ? "Post saved." : "Removed from Saved.");
    } catch (error) {
      setSaved(old => wasSaved ? (old.includes(post.id) ? old : [...old, post.id]) : old.filter(id => id !== post.id));
      setSavedPosts(old => wasSaved ? (old.some(item => item.id === post.id) ? old : [post, ...old]) : old.filter(item => item.id !== post.id));
      notify(error?.message || "Couldn't update saved posts.");
    }
  }
  async function toggleBlock(person, shouldBlock) {
    if (!person.id) { notify("Only registered accounts can be blocked."); return; }
    try {
      const response = await fetch(API_BASE + "/api/users/" + person.id + "/block", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: shouldBlock })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't update blocked accounts.");
      if (shouldBlock) {
        setBlocked(old => old.some(item => item.id === person.id) ? old : [...old, person]);
        setPeople(old => old.filter(item => item.id !== person.id));
        setFollowing(old => old.filter(item => item !== person.handle));
        notify(person.name + " has been blocked.");
      } else {
        setBlocked(old => old.filter(item => item.id !== person.id));
        notify(person.name + " has been unblocked.");
      }
    } catch (error) {
      notify(error?.message || "Couldn't update blocked accounts.");
    }
  }
  async function changeFeed(mode) {
    setFeedMode(mode);
    try {
      const response = await fetch(API_BASE + "/api/posts?feed=" + encodeURIComponent(mode), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Couldn't load this feed.");
      const items = Array.isArray(result.posts) ? result.posts : [];
      setPosts(items);
      setLiked(items.filter(post => post.isLiked).map(post => post.id));
    } catch (error) {
      notify(error?.message || "Couldn't load this feed.");
    }
  }
  async function loadConversations(archivedOverride = showArchived, preferredConversationId = null) {
    try {
      const response = await fetch(API_BASE + "/api/conversations?archived=" + String(archivedOverride), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't load your conversations.");
      const items = Array.isArray(result.conversations) ? result.conversations : [];
      setConversations(items);
      const preferredId = preferredConversationId || activeConversationId;
      if (preferredId && items.some(item => String(item.id) === String(preferredId))) {
        setActiveConversationId(preferredId);
      } else if (preferredId && !items.some(item => String(item.id) === String(preferredId))) {
        setActiveConversationId(items.length ? items[0].id : null);
      } else if (!preferredId && items.length && !archivedOverride) {
        setActiveConversationId(items[0].id);
      }
    } catch (error) {
      notify(error?.message || "We couldn't load your conversations.");
    }
  }

  async function loadThread(conversationId) {
    if (!conversationId) { setThreadMessages([]); return; }
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(conversationId) + "/messages", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't load this conversation.");
      setThreadMessages(Array.isArray(result.messages) ? result.messages : []);
    } catch (error) {
      notify(error?.message || "We couldn't load this conversation.");
    }
  }

  async function startConversation(user) {
    try {
      const response = await fetch(API_BASE + "/api/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't start that conversation.");
      setShowArchived(false);
      setShowNewMessage(false);
      setMessageSearch("");
      setActiveConversationId(result.conversationId);
      setActive("Messages");
      await loadConversations(false, result.conversationId);
      await loadThread(result.conversationId);
    } catch (error) {
      notify(error?.message || "We couldn't start that conversation.");
    }
  }

  async function sendMessage() {
    const content = messageDraft.trim();
    if (!content || !activeConversationId || messageBusy) return;
    setMessageBusy(true);
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(activeConversationId) + "/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send that message.");
      setMessageDraft("");
      await Promise.all([loadThread(activeConversationId), loadConversations()]);
    } catch (error) {
      notify(error?.message || "We couldn't send that message.");
    } finally {
      setMessageBusy(false);
    }
  }

  async function searchMessageUsers(value) {
    if (value.trim().length < 2) { setMessageUserResults([]); return; }
    try {
      const response = await fetch(API_BASE + "/api/users?search=" + encodeURIComponent(value.trim()), { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Account search failed.");
      setMessageUserResults(Array.isArray(result.users) ? result.users : []);
    } catch (error) {
      notify(error?.message || "Account search failed.");
    }
  }

  async function toggleConversationArchive(conversationId, archive) {
    try {
      const response = await fetch(API_BASE + "/api/conversations/" + encodeURIComponent(conversationId) + "/archive", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't update that conversation.");
      setActiveConversationId(null);
      await loadConversations();
      notify(archive ? "Conversation archived." : "Conversation restored to your inbox.");
    } catch (error) {
      notify(error?.message || "We couldn't update that conversation.");
    }
  }
  const filteredPeople = useMemo(() => people.filter(p => (p.name + " " + p.handle + " " + p.bio).toLowerCase().includes(query.toLowerCase())), [query]);
  const trendingTopics = useMemo(() => {
    const counts = new Map();
    posts.forEach(post => {
      const tags = String(post.text || "").match(/#[a-z0-9_]+/gi) || [];
      tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([tag, count]) => [tag, count + (count === 1 ? " post" : " posts"), "Community"]);
  }, [posts]);
  const myInitials = displayName.split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase() || "YO";
  const titleCopy = {
    Home: ["Your feed", "Catch up with the people and ideas you care about."],
    Explore: ["Explore", "Find conversations, people and ideas worth your time."],
    Live: ["Gist-Up Live", "A safer space for real-time community moments."],
    Communities: ["Communities", "Find your people around the things you love."],
    Messages: ["Messages", "Keep the conversation going."],
    Notifications: ["Notifications", "The latest from your Gist Up community."],
    Saved: ["Saved posts", "Keep the posts you want to come back to."],
    Profile: ["Your profile", "Your corner of Gist Up, shaped by you."],
    "Creator Studio": ["Creator Studio", "A home for your ideas, posts and creative progress."],
    "Gisty AI": ["Gisty AI", "Your creative sidekick inside Gist Up."],
    "Ads Manager": ["Ads Manager", "Manage promotional ideas and campaign drafts."],
    "Settings & Privacy": ["Settings & Privacy", "Your account, your choices."]
  };
  function HeaderTitle() {
    const [title, subtitle] = titleCopy[active] || [active, "Make this space yours."];
    return <div className="page-heading"><div><p className="eyebrow">YOUR PEOPLE. YOUR STORIES.</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>{["Home","Profile"].includes(active) && <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18}/> Create post</button>}</div>;
  }
  async function sharePost(post) {
    const shareUrl = new URL(window.location.href);
    shareUrl.hash = "post-" + post.id;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Post on Gist Up", text: post.text, url: shareUrl.toString() });
        return;
      }
      if (!navigator.clipboard?.writeText) throw new Error("Sharing isn't available in this browser. Copy the page address from your browser to share it.");
      await navigator.clipboard.writeText(shareUrl.toString());
      notify("Post link copied. Share it with your people.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      notify(error?.message || "Couldn't share this post. Please try again.");
    }
  }

  useEffect(() => {
    const match = window.location.hash.match(/^#post-(\d+)$/);
    if (!match || !posts.some(post => String(post.id) === match[1])) return;
    const timer = window.setTimeout(() => document.getElementById("post-" + match[1])?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => window.clearTimeout(timer);
  }, [posts, authUser]);

  function PostCard({ post }) {
    const isLiked = liked.includes(post.id);
    return <article id={"post-" + post.id} className="post-card" key={post.id}>
      <div className="post-header"><button className="profile-avatar-link" aria-label={"View " + post.name + " profile"} onClick={() => post.authorId && openUserProfile({ id: post.authorId })}><Avatar initials={post.initials} tone={post.tone} imageUrl={post.avatar_url}/></button><div className="post-author"><strong><button className="profile-link" onClick={() => post.authorId && openUserProfile({ id: post.authorId })}>{post.name}</button>{post.is_verified&&<VerifiedBadge size={14}/>}</strong><span>{post.handle} · {post.time}</span></div><button className="icon-button post-more" aria-label="Post options" onClick={() => { setReportPost(post); setReportReason("Spam"); setReportDetails(""); }}><MoreHorizontal size={21}/></button></div>
      <p className="post-copy">{post.text}</p>{post.image_url && <img className="post-image" src={post.image_url} alt="Image attached to post" loading="lazy" />}{post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata">Your browser does not support video playback.</video>}<div className="post-tag"># {post.topic || "community"}</div>
      <div className="post-stats"><span>{post.likes} likes</span><span>{post.comments} comments</span></div>
      <div className="post-actions"><button className={isLiked ? "liked" : ""} onClick={() => toggleLike(post)}><Heart size={18} fill={isLiked ? "currentColor" : "none"}/> Like</button><button onClick={() => openComments(post.id)}><MessageSquare size={18}/> Comment</button><button className={reposted.includes(post.id) ? "liked" : ""} onClick={() => toggleRepost(post)}><Repeat2 size={18}/> {reposted.includes(post.id) ? "Reposted" : "Repost"}{post.reposts ? " · " + post.reposts : ""}</button><button aria-label="Share post" onClick={() => sharePost(post)}><Share2 size={18}/></button><button aria-label="Save post" className={saved.includes(post.id) ? "liked" : ""} onClick={() => toggleSave(post)}><Bookmark size={18} fill={saved.includes(post.id) ? "currentColor" : "none"}/></button></div>
    </article>;
  }
  function HomePage() {
    return <>
      <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-pill">YOUR PEOPLE. YOUR STORIES.</span><h2>A little more connection.<br/><span>A lot more you.</span></h2><p>A place to share your story, discover new perspectives, and find your people.</p><button onClick={() => go("Explore")}>Find your community <ArrowRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-card art-card-one"><b>Good energy</b><small>starts here</small></div><div className="art-card art-card-two"><div className="mini-avatars" aria-hidden="true"><i></i><i></i><i></i></div><b>Find your people</b><small>Make real connections</small></div></div></section>
      <section className="home-ai-card"><div className="home-ai-brand"><img src="/gisty-ai-mark.svg" alt="Gisty AI logo"/></div><div className="home-ai-copy"><span className="eyebrow">MEET YOUR AI SIDEKICK</span><h2>Need a hand? Ask Gisty AI.</h2><p>Get help with ideas, writing, questions, and your next conversation on Gist Up.</p></div><button className="primary-button" onClick={() => go("Gisty AI")}>Chat with Gisty AI <ArrowRight size={16}/></button></section>
      <section className="composer-card"><Avatar initials={myInitials} size="medium" imageUrl={authUser?.avatar_url}/><button className="composer-placeholder" onClick={() => setComposerOpen(true)}>What's on your mind?</button><button className="composer-tool" aria-label="Add photo" onClick={() => setComposerOpen(true)}><ImageIcon size={19}/></button><button className="composer-tool" aria-label="Add feeling" onClick={() => setComposerOpen(true)}><Smile size={19}/></button><button className="composer-post" onClick={() => setComposerOpen(true)}>Post</button></section>
      <div className="feed-tabs"><button className={feedMode==="for-you"?"tab-active":""} onClick={()=>changeFeed("for-you")}>For you</button><button className={feedMode==="following"?"tab-active":""} onClick={()=>changeFeed("following")}>Following</button><button onClick={() => go("Explore")}>Trending</button><span className="feed-sort">Latest <MoreHorizontal size={18}/></span></div>
      {posts.map(post => <PostCard post={post} key={post.id}/>)}
    </>;
  }
  function ExplorePage() {
    const matchingPosts = posts.filter(post => [post.text, post.name, post.handle, post.topic].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
    return <div className="screen-stack"><div className="search-large"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, topics, and communities"/></div><section className="feature-panel explore-feature"><div><span className="welcome-pill"><Flame size={13}/> DISCOVER</span><h2>What's your next conversation?</h2><p>Find registered members and posts from your Gist Up community.</p></div><Compass size={54}/></section><section className="content-panel"><div className="section-title"><h2>People you might like</h2><span>{filteredPeople.length} suggestions</span></div>{filteredPeople.map(p=><div className="person-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone} imageUrl={p.avatar_url}/><div className="person-copy"><strong><button className="profile-link" onClick={() => openUserProfile(p)}>{p.name}</button></strong><span>{p.handle}</span><p>{p.bio}</p></div><button className={following.includes(p.handle)?"follow-button following":"follow-button"} onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}{!filteredPeople.length&&<p className="empty-state">No registered people match this search yet.</p>}</section><section className="content-panel"><div className="section-title"><h2>Topics in your feed</h2><span>From real posts</span></div>{trendingTopics.length?<div className="topic-grid">{trendingTopics.map(([tag,count,category])=><button className="topic-card" key={tag} onClick={()=>setQuery(tag.replace("#",""))}><span>{category}</span><strong>{tag}</strong><small>{count}</small><ArrowUpRight size={16}/></button>)}</div>:<div className="empty-state-box"><Hash size={24}/><strong>No topics to show yet</strong><p>Topics will appear here as people publish posts with hashtags or topic labels.</p></div>}</section><section className="content-panel"><div className="section-title"><h2>{query.trim()?"Matching posts":"Posts worth a look"}</h2><span>{matchingPosts.length} posts</span></div>{matchingPosts.slice(0,5).map(post=><PostCard post={post} key={post.id}/>)}{!matchingPosts.length&&<p className="empty-state">No posts match this search yet.</p>}</section></div>;
  }
  function CommunitiesPage() {
    const tones = ["lavender", "mint", "peach"];
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Users size={13}/> FIND YOUR PEOPLE</span><h2>Belong to something good.</h2><p>Discover real communities created by Gist Up members, or start one around something you care about.</p></div><Users size={54}/></section><div className="section-title"><h2>Communities to explore</h2><button className="outline-button compact" onClick={()=>setCommunityFormOpen(value=>!value)}><Plus size={15}/>{communityFormOpen?"Cancel":"Create community"}</button></div>{communityFormOpen&&<section className="content-panel"><h3>Create a community</h3><label className="auth-label">Community name<input value={communityName} onChange={e=>setCommunityName(e.target.value)} maxLength={70} placeholder="e.g. Lagos Creatives"/></label><label className="auth-label">Description<textarea value={communityDescription} onChange={e=>setCommunityDescription(e.target.value)} maxLength={300} placeholder="What will members share or discuss?"/></label><button className="primary-button" disabled={communityBusy||communityName.trim().length<3||communityDescription.trim().length<10} onClick={createCommunity}>{communityBusy?"Creating…":"Create community"} <ArrowRight size={16}/></button></section>}<div className="community-grid">{communities.map((community,index)=>{const joined=communityJoined.includes(String(community.id));const tone=tones[index%tones.length];const initials=String(community.name||"C").split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();return <article className="community-card" key={community.id}><div className={"community-art "+tone}><Avatar initials={initials} tone={tone} size="large"/></div><div className="community-card-body"><h3>{community.name}</h3><p>{community.description}</p><span><Users size={14}/> {Number(community.member_count||0).toLocaleString()} {Number(community.member_count)===1?"member":"members"}</span><button className={joined?"outline-button":"primary-button"} onClick={()=>toggleCommunityMembership(community)}>{joined?<><Check size={15}/> Joined</>:<>Join community <ArrowRight size={15}/></>}</button></div></article>})}{!communities.length&&<div className="empty-panel"><div className="placeholder-icon"><Users size={27}/></div><h2>No communities yet</h2><p>Be the first to create a community and invite people to join.</p><button className="primary-button" onClick={()=>setCommunityFormOpen(true)}>Create a community <Plus size={16}/></button></div>}</div></div>;
  }
  function MessagesPage() {
    const current = conversations.find(c => String(c.id) === String(activeConversationId));
    const visibleConversations = conversations.filter(c => {
      const text = [c.full_name, c.username, c.last_message || ""].join(" ").toLowerCase();
      return text.includes(messageSearch.toLowerCase());
    });
    const initialsFor = name => String(name || "?").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    const formatTime = value => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    return <div className="messages-layout">
      <section className="message-list-panel">
        <div className="message-list-head"><h2>Chats</h2></div>
        <div className="search-small"><Search size={16}/><input value={messageSearch} onChange={e => setMessageSearch(e.target.value)} placeholder="Search conversations"/></div>
        <div className="message-filters"><button className={!showArchived?"tab-active":""} onClick={() => { setShowArchived(false); setActiveConversationId(null); }}>All</button><button className={showArchived?"tab-active":""} onClick={() => { setShowArchived(true); setActiveConversationId(null); }}>Archived</button></div>
        {visibleConversations.length ? visibleConversations.map(c => <button className={"conversation-row "+(String(activeConversationId)===String(c.id)?"conversation-active":"")} key={c.id} onClick={() => { setActiveConversationId(c.id); loadThread(c.id); }}><Avatar initials={initialsFor(c.full_name)} imageUrl={c.avatar_url}/><span className="conversation-copy"><strong>{c.full_name}</strong><small>{c.last_message || "Start the conversation"}</small></span><span className="conversation-meta"><small>{formatTime(c.last_message_at)}</small></span></button>) : <div className="empty-state">No {showArchived ? "archived " : ""}conversations yet. Follow someone or visit their profile to message them.</div>}
      </section>
      <section className="chat-panel">
        {current ? <>
          <div className="chat-head"><Avatar initials={initialsFor(current.full_name)}/><div><strong>{current.full_name}</strong><span>@{current.username}</span></div><button className="icon-button" aria-label={showArchived?"Restore conversation":"Archive conversation"} onClick={() => toggleConversationArchive(current.id, !showArchived)}><Archive size={18}/></button></div>
          <div className="chat-history"><div className="chat-date">MESSAGES</div>{threadMessages.length ? threadMessages.map(m => <div className={"chat-message "+(String(m.sender_id)===String(authUser?.id)?"mine":"")} key={m.id}><p>{m.content}</p><small>{formatTime(m.created_at)}</small></div>) : <p className="empty-state">This is the beginning of your conversation. Send a message to get started.</p>}</div>
          {!showArchived && <div className="chat-compose"><div className="chat-emoji-wrap"><button className="icon-button" type="button" aria-label="Choose emoji" aria-expanded={emojiPickerOpen} onClick={() => setEmojiPickerOpen(value => !value)}>😊</button>{emojiPickerOpen&&<div className="chat-emoji-picker" role="group" aria-label="Choose an emoji">{["😀","😂","🤣","😊","😍","🥰","😘","😎","😭","🥹","😅","😉","🙌","👏","❤️","💜","🔥","✨","🎉","👍","🙏","🤔","😮","😢","💯","🥳","🤗","💪"].map(emoji=><button type="button" key={emoji} onClick={()=>{setMessageDraft(value=>value+emoji);setEmojiPickerOpen(false);}}>{emoji}</button>)}</div>}</div><input value={messageDraft} onChange={e=>setMessageDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Write a message…" maxLength={4000}/><button className="primary-button send-message" onClick={sendMessage} disabled={!messageDraft.trim()||messageBusy}><Send size={16}/></button></div>}
          <p className="preview-note chat-note">Messages are saved to your Gist Up account. Both people must have registered accounts.</p>
        </> : <div className="empty-panel chat-empty"><div className="placeholder-icon"><MessageCircle size={27}/></div><h2>{showArchived?"Your archived chats":"Your conversations"}</h2><p>Select a chat, or use the pencil button to start a conversation with a registered Gist Up user.</p><button className="primary-button" onClick={() => go("Explore")}>Find people <Users size={15}/></button></div>}
      </section>
    </div>;
  }
  function NotificationsPage() {
    const actionText = { follow: "started following you.", like: "liked your post.", comment: "commented on your post.", message: "sent you a message.", repost: "reposted your post." , community: "joined your community." };
    const filtered = notifications.filter(item => notificationFilter === "All" || (notificationFilter === "Follows" && item.type === "follow") || (notificationFilter === "Comments" && item.type === "comment"));
    async function markAllRead() {
      try {
        const response = await fetch(API_BASE + "/api/notifications/read-all", { method: "PATCH", credentials: "include" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Couldn't mark notifications as read.");
        setNotifications(old => old.map(item => ({ ...item, is_read: true })));
        notify("All notifications marked as read.");
      } catch (error) { notify(error?.message || "Couldn't update notifications."); }
    }
    return <div className="content-panel notifications-panel"><div className="notification-tabs">{["All","Comments","Follows"].map(t=><button className={notificationFilter===t?"tab-active":""} onClick={()=>setNotificationFilter(t)} key={t}>{t}</button>)}<button className="text-button mark-read" onClick={markAllRead}>Mark all as read</button></div>{filtered.map((item,index)=>{const name=item.actor_name||"Gist Up member";const initials=String(name).split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();const time=new Date(item.created_at).toLocaleString();return <div className={"notification-row "+(item.is_read?"notification-read":"")} key={item.id}><Avatar initials={initials} tone={["lavender","mint","peach"][index%3]}/><div><p><strong>{name}</strong> {actionText[item.type]||"interacted with you."}</p><span>{time}</span></div>{!item.is_read&&<i/>}</div>})}{!filtered.length&&<div className="empty-state-box"><Bell size={24}/><strong>No notifications yet</strong><p>New follows, likes, comments, and messages will appear here.</p></div>}</div>;
  }
  function SavedPage() { return <div className="screen-stack">{savedPosts.length?savedPosts.map(post=><PostCard post={post} key={post.id}/>):<div className="empty-panel"><div className="placeholder-icon"><Bookmark size={27}/></div><h2>Your saved posts live here</h2><p>Tap the bookmark on a post to keep it close for later.</p><button className="primary-button" onClick={()=>go("Home")}>Explore your feed <ArrowRight size={16}/></button></div>}</div>; }
  function ProfilePage() {
    const myPosts = posts.filter(p => p.handle === handle);
    const visibleProfilePosts = profileTab === "Likes" ? likedPosts : myPosts;
    const mediaPosts = myPosts.filter(post => post.image_url || post.video_url || post.media_url || post.imageUrl);
    const emptyTitle = profileTab === "Posts" ? "Your story starts with a post" : profileTab === "Likes" ? "No liked posts yet" : profileTab === "Replies" ? "Your replies will appear here" : "No media posts yet";
    const emptyCopy = profileTab === "Posts" ? "Share something with your community to get started." : profileTab === "Likes" ? "Posts you like will appear here so you can find them again." : profileTab === "Replies" ? "When you comment on conversations, your replies will be collected here." : "Posts with attached media will appear in this section.";
    return <div className="screen-stack"><section className="profile-page-card"><div className="profile-page-cover" style={authUser?.cover_url ? {backgroundImage:"url("+authUser.cover_url+")",backgroundSize:"cover",backgroundPosition:"center"} : undefined}><label className="cover-edit"><Camera size={15}/> Edit cover<input type="file" accept="image/*" onChange={e=>handleImagePick(e,"cover")} hidden /></label></div><div className="profile-page-body"><Avatar initials={myInitials} size="profile-avatar" imageUrl={authUser?.avatar_url}/><button className="outline-button edit-profile-button" onClick={() => setEditProfile(true)}><Pencil size={14}/> Edit profile</button><h2>{displayName} {authUser?.is_verified&&<VerifiedBadge size={17}/>}</h2><span className="profile-handle">{handle}</span><p>{profileBio}</p><div className="profile-page-stats"><span><b>{myPosts.length}</b> posts</span><span><b>{following.length}</b> following</span><span><b>{followerCount}</b> followers</span></div><div className="profile-tabs">{["Posts","Replies","Media","Likes"].map(t=><button className={profileTab===t?"tab-active":""} onClick={()=>setProfileTab(t)} key={t}>{t}</button>)}</div></div></section>{profileTab==="Replies" ? (myReplies.length ? myReplies.map(reply=><article className="content-panel profile-reply-card" key={reply.id}><div className="post-author"><strong>Your reply</strong><span>{new Date(reply.created_at).toLocaleString()}</span></div><p className="post-copy">{reply.content}</p><div className="reply-context"><span>Replying to <strong>{reply.post_author_name}</strong> (@{reply.post_author_username})</span><p>{reply.post_content}</p><button className="text-button" onClick={()=>openComments(reply.post_id)}>View conversation <ArrowRight size={14}/></button></div></article>) : <div className="empty-panel compact-empty"><h3>{emptyTitle}</h3><p>{emptyCopy}</p><button className="primary-button" onClick={()=>go("Home")}>Join a conversation <ArrowRight size={16}/></button></div>) : profileTab==="Media" ? (mediaPosts.length ? mediaPosts.map(post=><PostCard post={post} key={post.id}/>) : <div className="empty-panel compact-empty"><h3>{emptyTitle}</h3><p>{emptyCopy}</p><button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create post</button></div>) : visibleProfilePosts.length ? visibleProfilePosts.map(post=><PostCard post={post} key={post.id}/>) : <div className="empty-panel compact-empty"><h3>{emptyTitle}</h3><p>{emptyCopy}</p>{profileTab==="Posts"&&<button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create post</button>}</div>}</div>;
  }
  function OtherProfilePage() {
    const profile = selectedProfile;
    if (!profile) return <ProfilePage />;
    const person = { id: profile.id, name: profile.name, handle: profile.handle, initials: profile.initials };
    return <div className="screen-stack">
      <section className="profile-page-card">
        <div className="profile-page-cover" />
        <div className="profile-page-body">
          <Avatar initials={profile.initials} size="profile-avatar" imageUrl={profile.avatar_url}/>
          <div className="profile-actions">
            <button className="outline-button" onClick={() => startConversation({id: profile.id})}><MessageCircle size={15}/> Message</button>
            <button className={profile.isFollowing ? "outline-button" : "primary-button"} onClick={async () => {
              const updated = await toggleFollow(person);
              if (updated) await openUserProfile(person);
            }}>
              {profile.isFollowing ? <><Check size={15}/> Following</> : <><UserPlus size={15}/> {profile.followsYou ? "Follow back" : "Follow"}</>}
            </button>
          </div>
          <h2>{profile.name}</h2><span className="profile-handle">{profile.handle}</span><p>{profile.bio || "This member hasn't added a bio yet."}</p>
          <div className="profile-page-stats">
            <span><b>{profile.posts.length}</b> posts</span>
            <span><b>{profile.followingCount}</b> following</span>
            <span><b>{profile.followersCount}</b> followers</span>
          </div>
          {profile.followsYou && <span className="welcome-pill">FOLLOWS YOU</span>}
        </div>
      </section>
      {profile.posts.length ? profile.posts.map(post => <PostCard post={post} key={post.id}/>) : <div className="empty-panel compact-empty"><h3>No posts yet</h3><p>When {profile.name} shares a post, it will appear here.</p></div>}
    </div>;
  }
  function CreatorStudioPage() {
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"> CREATOR SPACE</span><h2>Make something meaningful.</h2><p>Draft your next post, review your recent activity, and keep your ideas moving.</p><button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create a post</button></div></section><div className="stats-grid"><div className="stat-card"><span>Posts in preview</span><b>{posts.filter(p=>p.handle===handle).length}</b><small><FileText size={14}/> Published drafts</small></div><div className="stat-card"><span>Total likes</span><b>{posts.filter(p=>p.handle===handle).reduce((n,p)=>n+p.likes,0)}</b><small><Heart size={14}/> Engagement preview</small></div><div className="stat-card"><span>Following</span><b>{following.length}</b><small><Users size={14}/> Your connections</small></div></div><section className="content-panel"><div className="section-title"><h2>Your recent posts</h2><button className="text-button" onClick={()=>go("Profile")}>View profile</button></div>{posts.filter(p=>p.handle===handle).length?posts.filter(p=>p.handle===handle).map(p=><PostCard post={p} key={p.id}/>):<p className="empty-state">You haven't published a post in this preview yet.</p>}</section><section className="content-panel"><div className="section-title"><h2>Creator tools</h2></div><div className="tool-grid"><button onClick={()=>setComposerOpen(true)}><Pencil size={19}/><strong>Post composer</strong><span>Write and share an update</span></button><button onClick={()=>go("Explore")}><TrendingUp size={19}/><strong>Discover trends</strong><span>Find relevant conversations</span></button><button onClick={()=>go("Gisty AI")}><Bot size={19}/><strong>Idea assistant</strong><span>Get help with your next idea</span></button></div></section></div>;
  }
  function AssistantPage() { return <div className="assistant-page"><section className="assistant-hero"><div className="assistant-orb"><img src="/gisty-ai-mark.svg" alt="Gisty AI logo" /></div><span className="welcome-pill">GISTY AI · YOUR CREATIVE SIDEKICK</span><h2>What are we creating today?</h2><p>Ask questions, work through ideas, write naturally, or switch to image mode to create artwork for your next post.</p><div className="prompt-chips">{["Give me post ideas","Improve my caption","Suggest a community topic"].map(x=><button key={x} onClick={()=>{setAssistantStudyMode(false);setAssistantPrompt(x)}}>{x}</button>)}</div><div className="gisty-input-actions" style={{justifyContent:"flex-start",marginTop:14}}><button type="button" className={"outline-button compact "+(assistantStudyMode?"gisty-image-mode-active":"")} onClick={()=>{setAssistantStudyMode(v=>!v);setAssistantImageMode(false);setAssistantPrompt("");}}><BookOpen size={15}/>{assistantStudyMode?"Study Assistant on":"Study Assistant"}</button><span className="muted">{assistantStudyMode?"Learning help is active. Ask about a topic or assignment.":"Switch on for step-by-step learning support."}</span></div><div className="assistant-status-row"><span className={"assistant-status-dot "+(assistantStatus==="ready"?"ready":assistantStatus==="needs-key"||assistantStatus==="error"?"needs-attention":"")}/><span>{assistantStatus==="ready"?"AI provider configured"+(assistantModel?" · "+assistantModel:""):assistantStatus==="needs-key"?"Provider key required":assistantStatus==="checking"?"Checking provider configuration…":assistantStatus==="error"?"Could not check provider status":"AI provider status not checked"}</span><div className="assistant-status-actions"><button className="outline-button compact" onClick={startNewGistyChat}>New chat</button><button className="outline-button compact" onClick={checkGistyAIStatus} disabled={assistantStatus==="checking"}>{assistantStatus==="checking"?"Checking…":"Check connection"}</button></div></div></section>{assistantMessages.length>0&&<div className="assistant-chat-history" aria-live="polite">{assistantMessages.map((message,index)=><div className={"assistant-chat-row "+(message.role==="user"?"user-message":"ai-message")} key={index}>{message.role==="assistant"&&<div className="gisty-avatar"><img src="/gisty-ai-mark.svg" alt="Gisty AI logo"/></div>}<div className="assistant-chat-bubble"><strong>{message.role==="user"?"You":"Gisty AI"}</strong><p style={{whiteSpace:"pre-line"}}>{message.content}</p>{message.imageUrl&&<><img className="gisty-generated-image" src={message.imageUrl} alt="Image generated by Gisty AI"/><div className="gisty-image-actions"><a className="outline-button compact" href={message.imageUrl} download="gisty-ai-image.png">Download image</a><button className="outline-button compact" onClick={()=>useGistyImageInPost(message.imageUrl)}><ImageIcon size={14}/> Use in post</button></div></>}</div></div>)}{assistantBusy&&<div className="assistant-chat-row ai-message"><div className="gisty-avatar"><img src="/gisty-ai-mark.svg" alt="Gisty AI logo"/></div><div className="assistant-chat-bubble"><strong>Gisty AI</strong><p>Thinking…</p></div></div>}</div>}<div className="assistant-input"><textarea value={assistantPrompt} onChange={e=>setAssistantPrompt(e.target.value)} maxLength={2000} placeholder={assistantImageMode?"Describe the picture you want…":assistantStudyMode?"Ask a question about your assignment or a school topic…":"Message Gisty AI…"}/><div className="gisty-input-actions"><button className={"outline-button compact "+(assistantImageMode?"gisty-image-mode-active":"")} onClick={()=>setAssistantImageMode(v=>!v)} type="button"><ImageIcon size={15}/>{assistantImageMode?"Image mode on":"Generate image"}</button><button className="primary-button" onClick={askGistyAI} disabled={!assistantPrompt.trim()||assistantBusy}>{assistantBusy?"Working…":assistantImageMode?<> Generate</>:<><Send size={16}/> Send</>}</button></div><small>{assistantImageMode?"Image generation uses Cloudflare Workers AI.":assistantStudyMode?"Gisty helps you understand the work. Check your school instructions and write final answers in your own words.":"Gisty AI may make mistakes. Review suggestions before posting."}</small></div></div>; }
  async function generateStudioImage() {
    const prompt = studioPrompt.trim();
    if (!prompt || studioBusy) return;
    setStudioBusy(true); setStudioError(""); setStudioImageUrl("");
    try {
      const response = await fetch(API_BASE + "/api/ai/image", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Gisty couldn't generate this image.");
      if (!result.imageUrl) throw new Error("The image provider returned no usable image.");
      setStudioImageUrl(result.imageUrl);
    } catch (error) {
      setStudioError(error?.message || "Image generation failed. Please try again.");
    } finally {
      setStudioBusy(false);
    }
  }
  function ImageStudioPage() {
    return <div className="screen-stack">
      <section className="feature-panel"><div><span className="welcome-pill"><ImageIcon size={13}/> GISTY AI IMAGE STUDIO</span><h2>Turn your ideas into images.</h2><p>Describe an image, generate it, then download it or add it to a post. Image generation may use paid provider credits.</p></div></section>
      <section className="content-panel">
        <h2 className="panel-heading">Create an image</h2>
        <label className="field-label" htmlFor="studio-image-prompt">Describe what you want to create</label>
        <textarea id="studio-image-prompt" className="studio-prompt-input" value={studioPrompt} onChange={e=>setStudioPrompt(e.target.value)} maxLength={1200} placeholder="Example: A modern purple-and-white Gist-Up launch poster, bold clean typography, friendly social energy, square format."/>
        <div className="gisty-input-actions"><small>{studioPrompt.length}/1200 characters</small><button className="primary-button" onClick={generateStudioImage} disabled={!studioPrompt.trim()||studioBusy}>{studioBusy?<> Creating image…</>:<><ImageIcon size={16}/> Generate image</>}</button></div>
        {studioBusy&&<div className="empty-state-box"><strong>Creating your image…</strong><p>This may take a little while. Keep this page open.</p></div>}
        {studioError&&<div className="empty-state-box"><strong>Image generation couldn't finish</strong><p>{studioError}</p></div>}
        {studioImageUrl&&<div className="studio-result"><img className="gisty-generated-image" src={studioImageUrl} alt="Image generated in Gisty AI Image Studio"/><div className="gisty-image-actions"><a className="outline-button compact" href={studioImageUrl} download="gisty-ai-image.png">Download image</a><button className="outline-button compact" onClick={()=>useGistyImageInPost(studioImageUrl)}><ImageIcon size={14}/> Use in post</button><button className="outline-button compact" onClick={()=>{setStudioImageUrl("");setStudioError("");}}>Create another</button></div></div>}
      </section>
    </div>;
  }
  function AdsManagerPage() {
    return <div className="screen-stack">
      <section className="feature-panel"><div><span className="welcome-pill"><Megaphone size={13}/> PROMOTION WORKSPACE</span><h2>Help the right people find you.</h2><p>Build campaign drafts, set a goal, and plan a daily budget before ads are reviewed for delivery.</p><button className="primary-button" onClick={()=>setCampaignModalOpen(true)}><Plus size={16}/> Create campaign</button></div><BarChart3 size={56}/></section>
      <div className="stats-grid"><div className="stat-card"><span>Campaign drafts</span><b>{campaigns.length}</b><small><FileText size={14}/> Saved to your account</small></div><div className="stat-card"><span>Reach</span><b>—</b><small>Available after ad delivery launches</small></div><div className="stat-card"><span>Spend</span><b>₦0</b><small>No billing or ads are active</small></div></div>
      <section className="content-panel"><h2 className="panel-heading">Campaign workspace</h2>{campaigns.length?campaigns.map(campaign=><div className="setting-row" key={campaign.id}><div><strong>{campaign.name}</strong><span>{campaign.goal} · ₦{Number(campaign.daily_budget).toLocaleString("en-NG")} per day</span><small>{campaign.audience||"Audience not specified"} · {campaign.status.replace("_"," ")}</small></div><span className="welcome-pill">{campaign.status==="draft"?"DRAFT":campaign.status.toUpperCase()}</span></div>):<div className="empty-state-box"><Megaphone size={26}/><strong>No campaigns yet</strong><p>Create a campaign draft to start planning. Drafts are saved, but they do not run ads or collect payments.</p></div>}</section>
      {campaignModalOpen&&<div className="modal-backdrop" onClick={()=>setCampaignModalOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Create campaign</h2><button className="icon-button" onClick={()=>setCampaignModalOpen(false)}><X size={20}/></button></div><p className="muted">Your campaign will be saved as a draft. It will not run or charge you.</p><label className="auth-label">Campaign name<input value={campaignName} onChange={e=>setCampaignName(e.target.value)} maxLength={100} placeholder="e.g. Launch week awareness"/></label><label className="auth-label">Campaign goal<select value={campaignGoal} onChange={e=>setCampaignGoal(e.target.value)}><option>Reach</option><option>Engagement</option><option>Website visits</option><option>Followers</option></select></label><label className="auth-label">Daily budget (₦)<input type="number" min="100" max="100000000" step="100" value={campaignBudget} onChange={e=>setCampaignBudget(e.target.value)}/></label><label className="auth-label">Target audience<input value={campaignAudience} onChange={e=>setCampaignAudience(e.target.value)} maxLength={240} placeholder="e.g. Students and young creators in Lagos"/></label><button className="primary-button auth-main-btn" onClick={createCampaign} disabled={campaignBusy}>{campaignBusy?"Saving…":"Save campaign draft"} <ArrowRight size={16}/></button></section></div>}
    </div>;
  }
  function SettingsPage() {
    const tabs=["Account","Verification","Privacy","Notifications","Appearance","Blocked accounts","Data & account", ...(isVerificationAdmin ? ["Verification review"] : [])];
    const notificationOptions=[
      ["notificationsFollowers","New followers","When someone follows your account."],
      ["notificationsEngagement","Likes and comments","When people engage with your posts."],
      ["notificationsMessages","Messages","When someone sends you a message."],
      ["notificationsCommunities","Community activity","Updates from communities you join."]
    ];
    return <div className="settings-layout"><section className="settings-menu">{tabs.map(t=><button key={t} className={settingsTab===t?"settings-selected":""} onClick={()=>setSettingsTab(t)}>{t==="Account"?<UserRound size={17}/>:t==="Privacy"?<Shield size={17}/>:t==="Notifications"?<Bell size={17}/>:t==="Appearance"?<Moon size={17}/>:t==="Blocked accounts"?<Ban size={17}/>:t==="Verification"||t==="Verification review"?<ShieldCheck size={17}/>:<Lock size={17}/>} {t}<ChevronRight size={15}/></button>)}</section><section className="settings-content"><h2>{settingsTab}</h2><p className="muted">Manage your real account preferences. Changes are saved to your account.</p>

      {settingsTab==="Verification"&&<div className="verification-panel">
        <div className="verification-intro"><span className="welcome-pill"><ShieldCheck size={14}/> ACCOUNT AUTHENTICITY</span><h3>Request a verified badge</h3><p>Verification helps people recognise authentic accounts. Applications are reviewed by the Gist-Up team; submitting a request does not guarantee approval.</p></div>
        <div className="content-panel verification-policy">
          <h3>Gist-Up Verification Rules</h3>
          <p>Verification is free and identifies authentic accounts. It is not an endorsement of an account or its content.</p>
          <strong>Who can apply?</strong>
          <ul><li>Content creators with a genuine public presence.</li><li>Public figures and notable professionals.</li><li>Legitimate businesses, brands and organisations.</li></ul>
          <strong>What we check</strong>
          <ul><li>Your account is active and profile information is accurate.</li><li>You represent the person, brand or organisation named on the account.</li><li>Public information reasonably supports your request.</li><li>Your account follows Gist-Up Community Guidelines.</li></ul>
          <strong>When a badge may be removed</strong>
          <p>Gist-Up may remove a badge for false information, impersonation, fraudulent verification, serious or repeated guideline violations, or an unapproved change of account ownership. We will provide a reason where possible. You may contact Gist-Up support to appeal.</p>
          <p className="preview-note">Never send passwords, login codes or private identity documents. Applying does not guarantee approval.</p>
        </div>
        {verificationApplication?.status==="approved" ? <div className="empty-state-box"><ShieldCheck size={28}/><strong>Your account is verified</strong><p>Your verification application was approved.</p></div>
        : verificationApplication?.status==="pending" ? <div className="empty-state-box"><Clock size={26}/><strong>Application under review</strong><p>Your request was submitted on {new Date(verificationApplication.created_at).toLocaleDateString()}. We'll update this page when a decision is made.</p></div>
        : verificationApplication?.status==="revoked" ? <div className="empty-state-box"><Shield size={26}/><strong>Your verified badge was removed</strong><p>{verificationApplication.reviewer_note || "Your account is no longer verified."} You may submit a new application after addressing the reason.</p></div>
        : <><div className="verification-safety-note"><Shield size={17}/><span>For your privacy, do not upload or send identity documents, passwords, sign-in codes, or private information. Share only public links that help confirm your account is authentic.</span></div>
          <label className="auth-label">Why should this account be verified?<textarea value={verificationReason} onChange={e=>setVerificationReason(e.target.value)} maxLength={1000} placeholder="Tell us what makes this account notable or how people can confirm it belongs to you." rows={5}/></label>
          <label className="auth-label">Public profile or website link (optional)<input type="url" value={verificationLink} onChange={e=>setVerificationLink(e.target.value)} placeholder="https://example.com/your-public-profile"/></label>
          <button className="primary-button auth-main-btn" disabled={verificationBusy||verificationReason.trim().length<40} onClick={submitVerificationApplication}>{verificationBusy?"Submitting…":"Submit verification request"} <ArrowRight size={16}/></button>
          <p className="preview-note">Free to apply. Gist-Up does not sell verification badges. You can apply again if a previous request was declined.</p>
        </>}
      </div>}
      {settingsTab==="Verification review"&&isVerificationAdmin&&<div className="verification-review">
        <p className="muted">Review requests carefully. Check only public information and never ask applicants to send passwords or private identity documents.</p>
        {verificationQueueBusy?<p className="muted">Loading applications…</p>:verificationQueue.length?verificationQueue.map(item=><article className="content-panel verification-application-card" key={item.id}>
          <div className="section-title"><div><h3>{item.full_name} {item.is_verified&&<VerifiedBadge size={14}/>}</h3><span>@{item.username} · {item.email}</span></div><span className={"welcome-pill verification-status "+item.status}>{item.status.toUpperCase()}</span></div>
          <p>{item.reason}</p>{item.public_links&&<a href={item.public_links} target="_blank" rel="noreferrer">Open public profile link <ArrowUpRight size={14}/></a>}
          {item.reviewer_note&&<p className="preview-note">Admin note: {item.reviewer_note}</p>}
          <small>Submitted {new Date(item.created_at).toLocaleString()}</small>
          {item.status==="pending"&&<div className="verification-actions"><button className="primary-button" onClick={()=>reviewVerificationApplication(item.id,"approved")}><Check size={15}/> Approve</button><button className="outline-button" onClick={()=>reviewVerificationApplication(item.id,"rejected")}>Reject</button></div>}
          {item.status==="approved"&&item.is_verified&&<div className="verification-actions"><button className="outline-button" onClick={()=>reviewVerificationApplication(item.id,"revoked")}><Shield size={15}/> Remove badge</button></div>}
        </article>):<div className="empty-state-box"><ShieldCheck size={26}/><strong>No verification applications yet</strong><p>New requests will appear here.</p></div>}
      </div>}
      {settingsTab==="Account"&&<><div className="setting-row"><div><strong>Profile information</strong><span>Change your name, handle and bio.</span></div><button className="outline-button compact" onClick={()=>setEditProfile(true)}>Edit profile</button></div><div className="setting-row"><div><strong>Email address</strong><span>{authUser?.email||email||"Your signed-in email"}</span></div><span>Account email</span></div><div className="setting-row"><div><strong>Password & security</strong><span>Change your password using your current password.</span></div><button className="outline-button compact" onClick={()=>setShowPasswordForm(value=>!value)}>{showPasswordForm?"Cancel":"Change password"}</button></div>{showPasswordForm&&<div className="content-panel"><label className="auth-label">Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label><label className="auth-label">New password<input type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={8}/></label><label className="auth-label">Confirm new password<input type="password" autoComplete="new-password" value={confirmNewPassword} onChange={e=>setConfirmNewPassword(e.target.value)}/></label><button className="primary-button" disabled={passwordBusy||!currentPassword||newPassword.length<8||!confirmNewPassword} onClick={updatePassword}>{passwordBusy?"Updating…":"Update password"} <Lock size={15}/></button></div>}</>}
      {settingsTab==="Privacy"&&<><div className="setting-row"><div><strong>Blocked accounts</strong><span>Review or unblock accounts you've blocked. Blocking already filters their posts from your feed.</span></div><button className="outline-button compact" onClick={()=>setSettingsTab("Blocked accounts")}>Manage</button></div><div className="setting-row"><div><strong>Profile visibility</strong><span>Your profile and posts are currently visible to signed-in members. Private-profile approval controls are not enabled yet.</span></div><Shield size={18}/></div><div className="setting-row"><div><strong>Direct messages</strong><span>Only start conversations with people you intend to contact. Message-request controls are not enabled yet.</span></div><MessageCircle size={18}/></div><div className="setting-row"><div><strong>Account sessions</strong><span>Sign out to clear this browser's Gist Up session.</span></div><button className="outline-button compact" onClick={async()=>{try{await fetch(API_BASE+"/api/auth/logout",{method:"POST",credentials:"include"});}finally{setAuthUser(null);setAuthMode("welcome");notify("You have been signed out.");}}}>Sign out</button></div></>}
      {settingsTab==="Notifications"&&<>{notificationOptions.map(([key,title,desc])=><div className="setting-row" key={key}><div><strong>{title}</strong><span>{desc}</span></div><button className={"toggle "+(settings[key]?"toggle-on":"")} disabled={settingsBusy} aria-label={title+" notifications"} aria-pressed={settings[key]===true} onClick={()=>updateSetting(key,!(settings[key]===true))}><i/></button></div>)}<p className="preview-note">These preferences are saved to your account. Delivery controls will be applied to notification delivery as those channels are added.</p></>}
      {settingsTab==="Appearance"&&<><div className="setting-row"><div><strong>Dark appearance</strong><span>Use a darker interface on this device. Your choice is saved to your account.</span></div><button className={"toggle "+(settings.darkMode?"toggle-on":"")} disabled={settingsBusy} aria-label="Toggle dark appearance" aria-pressed={settings.darkMode===true} onClick={()=>updateSetting("darkMode",!(settings.darkMode===true))}><i/></button></div><div className="setting-row"><div><strong>Theme colour</strong><span>Gist Up purple is the current brand theme.</span></div><span className="theme-dot"/></div></>}
      {settingsTab==="Blocked accounts"&&<>{blocked.length?blocked.map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone} imageUrl={p.avatar_url}/><div><strong>{p.name} {p.is_verified&&<VerifiedBadge size={13}/>}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>toggleBlock(p,false)}>Unblock</button></div>):<div className="empty-state-box"><Ban size={25}/><strong>No blocked accounts</strong><p>People you block will be listed here.</p></div>}<h3 className="subheading">Registered accounts</h3>{people.filter(p=>!blocked.some(b=>b.handle===p.handle)).map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone} imageUrl={p.avatar_url}/><div><strong>{p.name}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>toggleBlock(p,true)}>Block</button></div>)}{!people.length&&<p className="muted">No other registered accounts to show yet.</p>}</>}
      {settingsTab==="Data & account"&&<><div className="setting-row"><div><strong>Download your information</strong><span>Export your profile, posts, likes, saved posts, and comments as a JSON file.</span></div><button className="outline-button compact" onClick={downloadAccountData}><ArrowDownToLine size={15}/> Download</button></div><div className="setting-row"><div><strong>Deactivate account</strong><span>Temporary deactivation isn't available yet; your account remains active.</span></div><Lock size={18}/></div><div className="setting-row danger-row"><div><strong>Delete account</strong><span>Permanent deletion is not available in settings yet, so no account can be deleted accidentally.</span></div><Lock size={18}/></div></>}
    </section></div>;
  }
  function AuthPage() {
    return <div className="auth-shell"><div className="auth-left"><button className="brand auth-brand" onClick={()=>setAuthMode("welcome")}><span className="brand-mark"><img src="/gist-up-mark.svg" alt="" /></span><span>gist<span className="brand-up">up</span></span></button><div className="auth-promo"><span className="welcome-pill">YOUR PEOPLE. YOUR STORIES.</span><h1>A little more connection.<br/><span>A lot more you.</span></h1><p>Share your story, discover new perspectives, and find the people who make your world feel bigger.</p><div className="auth-floating-card"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><strong>Real people. Shared moments.</strong><small>Your next favourite conversation is out there.</small></div></div><div className="auth-foot">Made for the stories that bring us together. · © 2026 Gist Up</div></div><div className="auth-right"><div className="auth-form-wrap">{authMode==="welcome"?<><div className="auth-mobile-logo"><span className="brand-mark"><img src="/gist-up-mark.svg" alt="" /></span> gist<span className="brand-up">up</span></div><span className="eyebrow">WELCOME TO GIST UP</span><h2>Your people are here.</h2><p>Join conversations, share what matters, and make your space your own.</p><button className="primary-button auth-main-btn" onClick={()=>setAuthMode("signup")}>Create your account <ArrowRight size={17}/></button><button className="google-button" onClick={()=>notify("Google sign-in is not connected in this preview.")}><span className="google-g">G</span> Continue with Google</button><div className="auth-separator"><span>or</span></div><button className="outline-button auth-main-btn" onClick={()=>setAuthMode("login")}>Log in</button><button className="text-button preview-entry" onClick={()=>setAuthMode("app")}>Explore the website preview <ArrowRight size={15}/></button><small>By continuing, you agree to our Terms and Privacy Policy.</small></>:<><button className="back-link" onClick={()=>setAuthMode("welcome")}>← Back</button><span className="eyebrow">{authMode==="signup"?"GET STARTED":"WELCOME BACK"}</span><h2>{authMode==="signup"?"Create your account":"Log in to Gist Up"}</h2><p>{authMode==="signup"?"A few details and you're on your way.":"Your people and conversations are waiting."}</p>{authMode==="signup"&&<label className="auth-label">Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>}<label className="auth-label">Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="auth-label">Password<span className="password-input"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button onClick={()=>setShowPassword(!showPassword)} type="button" aria-label="Show password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label><button className="primary-button auth-main-btn" onClick={submitAuth} disabled={authBusy}>{authBusy ? "Please wait…" : authMode==="signup" ? "Create account" : "Log in"} <ArrowRight size={16}/></button>{authError && <p className="auth-error" role="alert">{authError}</p>}<div className="auth-switch">{authMode==="signup"?"Already have an account?":"New to Gist Up?"} <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")}>{authMode==="signup"?"Log in":"Create an account"}</button></div><small>"Your account is protected by the Gist Up account service."</small></>}</div></div></div>;
  }
  if (authMode!=="app") return <>{AuthPage()}{notice&&<div className="toast" role="status">{notice}</div>}</>;
  async function prepareLiveCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveCameraError("Camera access is unavailable in this browser. Open Gist Up using a modern browser over HTTPS.");
      return;
    }
    setLiveCameraBusy(true);
    setLiveCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setLiveStream(stream);
    } catch (error) {
      const message = error?.name === "NotAllowedError"
        ? "Camera or microphone permission was denied. Allow access in your browser settings and try again."
        : error?.name === "NotFoundError"
          ? "No camera or microphone was found on this device."
          : "Gist Up couldn't access your camera or microphone. Check that they are available and not being used by another app.";
      setLiveCameraError(message);
    } finally {
      setLiveCameraBusy(false);
    }
  }
  async function sendLiveSignal(sessionId, recipientUserId, type, payload) {
    const response = await fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(sessionId) + "/signals", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientUserId, type, payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The private connection could not be sent.");
    return data;
  }
  async function flushPendingIce(pc, participantId) {
    const queued = pendingIceRef.current.get(String(participantId)) || [];
    pendingIceRef.current.delete(String(participantId));
    for (const candidate of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (error) { console.warn("Live ICE candidate skipped:", error?.message || error); }
    }
  }
  function createLivePeer(session, participant, shouldOffer) {
    const participantId = String(participant.id);
    const existing = peerConnectionsRef.current.get(participantId);
    if (existing) return existing;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnectionsRef.current.set(participantId, pc);
    if (liveStream) liveStream.getTracks().forEach(track => pc.addTrack(track, liveStream));
    pc.onicecandidate = event => {
      if (event.candidate) sendLiveSignal(session.id, participantId, "ice", event.candidate.toJSON())
        .catch(error => setLiveCameraError(error.message));
    };
    pc.ontrack = event => {
      const stream = event.streams?.[0] || new MediaStream([event.track]);
      setLiveRemoteStreams(current => ({ ...current, [participantId]: stream }));
    };
    pc.onconnectionstatechange = () => {
      const peers = Array.from(peerConnectionsRef.current.values());
      if (peers.length && peers.every(peer => peer.connectionState === "connected")) setLiveStatus("connected");
      else if (peers.some(peer => ["failed", "disconnected"].includes(peer.connectionState))) setLiveStatus("connection-limited");
      else setLiveStatus("connecting");
    };
    if (shouldOffer) {
      (async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendLiveSignal(session.id, participantId, "offer", pc.localDescription);
        } catch (error) {
          setLiveCameraError(error.message || "Couldn't connect to another participant.");
        }
      })();
    }
    return pc;
  }
  function startLiveSignalPolling(session) {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    signalCursorRef.current = 0;
    livePollBusyRef.current = false;
    pollTimerRef.current = setInterval(async () => {
      if (livePollBusyRef.current) return;
      livePollBusyRef.current = true;
      try {
        const response = await fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(session.id) + "/signals?after=" + signalCursorRef.current, { credentials: "include" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "The private room is no longer available.");
        const roster = data.participants || [];
        fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(session.id) + "/battle", { credentials: "include" }).then(async r => { const d = await r.json().catch(() => ({})); if (r.ok) { setBattleState(d.battle || null); setBattleGifts(d.gifts || []); setRecentBattleGifts(d.recent_gifts || []); } }).catch(() => {});
        setLiveParticipants(roster);
        const activeIds = new Set(roster.filter(person => String(person.id) !== String(authUser?.id)).map(person => String(person.id)));
        for (const [id, peer] of peerConnectionsRef.current.entries()) {
          if (!activeIds.has(id)) {
            peer.close();
            peerConnectionsRef.current.delete(id);
            setLiveRemoteStreams(current => { const next = { ...current }; delete next[id]; return next; });
          }
        }
        for (const person of roster) {
          if (String(person.id) === String(authUser?.id)) continue;
          if (!peerConnectionsRef.current.has(String(person.id))) {
            const initiate = Number(authUser?.id) < Number(person.id);
            createLivePeer(session, person, initiate);
          }
        }
        for (const signal of data.signals || []) {
          signalCursorRef.current = Math.max(signalCursorRef.current, Number(signal.id) || 0);
          const senderId = String(signal.sender_user_id);
          const person = roster.find(item => String(item.id) === senderId);
          if (!person) continue;
          const pc = createLivePeer(session, person, false);
          if (signal.signal_type === "ice") {
            if (!pc.remoteDescription) {
              const queued = pendingIceRef.current.get(senderId) || [];
              queued.push(signal.payload);
              pendingIceRef.current.set(senderId, queued);
            } else {
              try { await pc.addIceCandidate(new RTCIceCandidate(signal.payload)); }
              catch (error) { console.warn("Live ICE candidate skipped:", error?.message || error); }
            }
          }
          if (signal.signal_type === "offer" && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
            await flushPendingIce(pc, senderId);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendLiveSignal(session.id, senderId, "answer", pc.localDescription);
          }
          if (signal.signal_type === "answer" && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
            await flushPendingIce(pc, senderId);
          }
        }
        if (!roster.length) setLiveStatus("waiting");
        else if (roster.length === 1) setLiveStatus("waiting");
      } catch (error) {
        setLiveCameraError(error.message || "The private connection was interrupted.");
        setLiveStatus("connection-limited");
      } finally { livePollBusyRef.current = false; }
    }, 1800);
  }

  async function submitLiveEligibility() {
    setLiveEligibilityError("");
    if (!liveBirthDate || !liveRulesAccepted) { setLiveEligibilityError("Complete the age check and accept the Live Rules."); return; }
    setLiveEligibilityBusy(true);
    try {
      const r = await fetch(API_BASE + "/api/live/eligibility", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({dateOfBirth:liveBirthDate,acceptedRules:true}) });
      const d = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(d.error || "Couldn't save the eligibility check.");
      setLiveEligibility(d.eligibility || null); setLiveBirthDate("");
      notify(d.eligibility?.eligible ? "Live eligibility saved." : "This account cannot host public Live.");
    } catch(e) { setLiveEligibilityError(e.message || "Couldn't save eligibility."); }
    finally { setLiveEligibilityBusy(false); }
  }
  async function sendPublicSignal(roomId, targetId, type, payload) {
    const r = await fetch(API_BASE + "/api/public-live/" + encodeURIComponent(roomId) + "/signals", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({recipientUserId:targetId,type,payload}) });
    const d = await r.json().catch(()=>({})); if (!r.ok) throw new Error(d.error || "Live video connection failed."); return d;
  }
  function createPublicPeer(room, person, shouldOffer, role) {
    const id=String(person.id); if(publicPeerRef.current.has(id)) return publicPeerRef.current.get(id);
    const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    publicPeerRef.current.set(id,pc);
    if(role==="host" && liveStream) liveStream.getTracks().forEach(track=>pc.addTrack(track,liveStream));
    pc.onicecandidate=e=>{if(e.candidate)sendPublicSignal(room.id,id,"ice",e.candidate.toJSON()).catch(err=>setPublicError(err.message));};
    pc.ontrack=e=>setPublicRemoteStream(e.streams?.[0]||new MediaStream([e.track]));
    if(shouldOffer) (async()=>{try{const offer=await pc.createOffer();await pc.setLocalDescription(offer);await sendPublicSignal(room.id,id,"offer",pc.localDescription);}catch(e){setPublicError(e.message||"Couldn't start the video connection.");}})();
    return pc;
  }
  function startPublicPolling(room, role) {
    if(publicPollRef.current)clearInterval(publicPollRef.current);
    publicSignalCursorRef.current=0;publicMessageCursorRef.current=0;publicPollBusyRef.current=false;
    publicPollRef.current=setInterval(async()=>{
      if(publicPollBusyRef.current)return;publicPollBusyRef.current=true;
      try{
        const url=API_BASE+"/api/public-live/"+encodeURIComponent(room.id)+"/state?afterSignal="+publicSignalCursorRef.current+"&afterMessage="+publicMessageCursorRef.current;
        const r=await fetch(url,{credentials:"include"});const d=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(d.error||"This broadcast is no longer available.");
        setPublicViewers(d.viewers||[]);setPublicCommentsEnabled(d.room?.comments_enabled!==false);setPublicLikesCount(Number(d.likes_count)||0);
        if(d.messages?.length){setPublicMessages(old=>[...old,...d.messages].slice(-80));publicMessageCursorRef.current=Math.max(publicMessageCursorRef.current,...d.messages.map(x=>Number(x.id)||0));}
        if(role==="host")for(const person of (d.viewers||[]))if(!publicPeerRef.current.has(String(person.id)))createPublicPeer(room,person,true,role);
        for(const signal of (d.signals||[])){
          publicSignalCursorRef.current=Math.max(publicSignalCursorRef.current,Number(signal.id)||0);
          const sender=role==="host"?(d.viewers||[]).find(x=>String(x.id)===String(signal.sender_user_id)):{id:room.host_user_id};
          if(!sender)continue;const pc=createPublicPeer(room,sender,false,role);
          if(signal.signal_type==="ice"){if(pc.remoteDescription){try{await pc.addIceCandidate(new RTCIceCandidate(signal.payload));}catch{}}}
          if(signal.signal_type==="offer"&&!pc.remoteDescription){await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await sendPublicSignal(room.id,sender.id,"answer",pc.localDescription);}
          if(signal.signal_type==="answer"&&!pc.remoteDescription)await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        }
      }catch(e){setPublicError(e.message||"Live connection interrupted.");if(/ended|unavailable|removed|not an active viewer/i.test(e.message||""))leavePublicLive(false);}
      finally{publicPollBusyRef.current=false;}
    },1600);
  }
  async function startPublicLive() {
    if(!liveStream){setPublicError("Turn on your camera and microphone first.");return;}
    setPublicError("");
    try{
      const r=await fetch(API_BASE+"/api/public-live",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:liveTitle})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Couldn't start public Live.");
      setPublicRoom(d.room);setPublicRole("host");setPublicMessages([]);setPublicViewers([]);startPublicPolling(d.room,"host");
    }catch(e){setPublicError(e.message||"Couldn't start public Live.");}
  }
  async function joinPublicLive(room) {
    setPublicError("");
    try{
      const r=await fetch(API_BASE+"/api/public-live/"+encodeURIComponent(room.id)+"/join",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:"{}"});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Couldn't join this broadcast.");
      setPublicRoom(d.room);setPublicRole("viewer");setPublicMessages([]);setPublicViewers([]);startPublicPolling(d.room,"viewer");
    }catch(e){setPublicError(e.message||"Couldn't join this broadcast.");}
  }
  async function leavePublicLive(endRoom=true) {
    const room=publicRoom;if(publicPollRef.current)clearInterval(publicPollRef.current);publicPollRef.current=null;
    publicPeerRef.current.forEach(pc=>pc.close());publicPeerRef.current.clear();setPublicRemoteStream(null);
    if(room?.id){try{await fetch(API_BASE+"/api/public-live/"+encodeURIComponent(room.id)+(publicRole==="host"&&endRoom?"":"/leave"),{method:"DELETE",credentials:"include"});}catch{}}
    setPublicRoom(null);setPublicRole("");setPublicViewers([]);setPublicMessages([]);
    fetch(API_BASE+"/api/public-live",{credentials:"include"}).then(r=>r.json()).then(d=>setPublicRooms(d.rooms||[])).catch(()=>{});
  }
  async function sendPublicMessage(type="comment",body=publicMessageText) {
    if(!publicRoom||!body.trim())return;
    try{
      const r=await fetch(API_BASE+"/api/public-live/"+encodeURIComponent(publicRoom.id)+"/messages",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,body:body.trim()})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Couldn't send that interaction.");
      if(d.message){setPublicMessages(old=>[...old,d.message].slice(-80));publicMessageCursorRef.current=Math.max(publicMessageCursorRef.current,Number(d.message.id)||0);}
      if(type==="comment")setPublicMessageText("");
    }catch(e){setPublicError(e.message||"Couldn't send that interaction.");}
  }
  async function sendPublicLike() {
    if(!publicRoom)return;
    try{
      const r=await fetch(API_BASE+"/api/public-live/"+encodeURIComponent(publicRoom.id)+"/likes",{method:"POST",credentials:"include"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Couldn't send your like.");
      setPublicLikesCount(Number(d.likes_count)||0);
      setPublicLikePulse(value=>value+1);
    }catch(e){setPublicError(e.message||"Couldn't send your like.");}
  }
  function handlePublicVideoTap(event) {
    const now=Date.now();
    if(now-lastPublicTapRef.current<320){event.preventDefault();lastPublicTapRef.current=0;sendPublicLike();}
    else lastPublicTapRef.current=now;
  }

  async function moderatePublicLive(action,userId,enabled) {
    if(!publicRoom)return;
    try{
      const r=await fetch(API_BASE+"/api/public-live/"+encodeURIComponent(publicRoom.id)+"/moderation",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,userId,enabled})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Moderation action failed.");
      if(action==="comments")setPublicCommentsEnabled(d.comments_enabled);
      if(action==="remove")setPublicViewers(old=>old.filter(x=>String(x.id)!==String(userId)));
    }catch(e){setPublicError(e.message||"Moderation action failed.");}
  }

  async function startPrivateLive() {
    if (!liveStream) { setLiveCameraError("Turn on your camera and microphone first."); return; }
    setLiveCameraError("");
    try {
      const response = await fetch(API_BASE + "/api/live/sessions", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: liveTitle })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't start the private room.");
      const session = data.session;
      setLiveSession(session); setLiveInviteCode(session.invite_code); setLiveRole("host");
      setLiveParticipants(data.participants || []); setLiveStatus("waiting");
      startLiveSignalPolling(session);
    } catch (error) {
      setLiveCameraError(error.message || "Couldn't start the private room.");
    }
  }
  async function joinPrivateLive() {
    const code = liveJoinCode.trim().toUpperCase();
    if (!code) { setLiveCameraError("Enter the invite code from the host."); return; }
    if (!liveStream) { setLiveCameraError("Turn on your camera and microphone before joining."); return; }
    setLiveCameraError("");
    try {
      const response = await fetch(API_BASE + "/api/live/sessions/join", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't join that private room.");
      const session = data.session;
      setLiveSession(session); setLiveInviteCode(""); setLiveRole("participant");
      setLiveParticipants(data.participants || []); setLiveStatus("connecting"); setLiveJoinCode("");
      startLiveSignalPolling(session);
    } catch (error) {
      setLiveCameraError(error.message || "Couldn't join that private room.");
    }
  }
  async function startBattle() {
    if (!liveSession || liveRole !== "host") return;
    setBattleBusy(true); setBattleError("");
    try {
      const r = await fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(liveSession.id) + "/battle/start", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durationSeconds: 180 }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Couldn't start the battle.");
      setBattleState(d.battle);
    } catch (e) { setBattleError(e.message || "Couldn't start the battle."); }
    finally { setBattleBusy(false); }
  }
  async function sendBattleLike() {
    if (!liveSession || !battleState || battleState.status !== "live") return;
    setBattleBusy(true); setBattleError("");
    try {
      const r = await fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(liveSession.id) + "/battle/like", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Couldn't send your battle like.");
      setBattleState(d.battle);
    } catch (e) { setBattleError(e.message || "Couldn't send your battle like."); }
    finally { setBattleBusy(false); }
  }
  async function sendBattleGift(giftType) {
    if (!liveSession || battleState?.status !== "live") return;
    setBattleBusy(true); setBattleError("");
    try {
      const r = await fetch(API_BASE + "/api/live/sessions/" + encodeURIComponent(liveSession.id) + "/battle/gift", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ giftType }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Couldn't send the free gift.");
      setBattleGifts(d.gifts || []);
      setRecentBattleGifts(d.recent_gifts || []);
    } catch (e) { setBattleError(e.message || "Couldn't send the free gift."); }
    finally { setBattleBusy(false); }
  }
  async function endPrivateLive() {
    const session = liveSession;
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = null;
    if (session) {
      const endpoint = liveRole === "host"
        ? "/api/live/sessions/" + encodeURIComponent(session.id)
        : "/api/live/sessions/" + encodeURIComponent(session.id) + "/participants/me";
      try { await fetch(API_BASE + endpoint, { method: "DELETE", credentials: "include" }); }
      catch { /* Local media is still closed below. */ }
    }
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    setLiveRemoteStreams({}); setLiveParticipants([]); setLiveSession(null); setLiveInviteCode(""); setLiveRole(""); setLiveStatus("idle");
    pendingIceRef.current.clear(); signalCursorRef.current = 0;
    liveStream?.getTracks().forEach(track => track.stop());
    setLiveStream(null); setLiveMuted(false); setLiveCameraOff(false);
  }
  function toggleLiveMute() {
    const next = !liveMuted;
    liveStream?.getAudioTracks().forEach(track => { track.enabled = !next; });
    setLiveMuted(next);
  }
  function toggleLiveCamera() {
    const next = !liveCameraOff;
    liveStream?.getVideoTracks().forEach(track => { track.enabled = !next; });
    setLiveCameraOff(next);
  }
  function stopLiveCamera() {
    if (liveSession) { endPrivateLive(); return; }
    liveStream?.getTracks().forEach(track => track.stop());
    setLiveStream(null);
  }

  function LivePage() {
    return <div className="screen-stack">
      <section className="feature-panel"><div><span className="welcome-pill"><Video size={13}/> GIST-UP LIVE</span><h2>Go live. Bring your people together.</h2><p>Public broadcasts, live viewers, chat and creator controls.</p><p className="preview-note">Free test capacity: 1 host + up to 4 viewers. Not unlimited streaming.</p></div><Video size={54}/></section>
      <section className="content-panel live-setup-panel">
        <div className="section-title"><h2>Public Live</h2><span className="welcome-pill">18+ HOSTS</span></div>
        {!publicRoom ? <>
          {liveEligibility?.eligible ? <div className="live-safety-note"><ShieldCheck size={17}/><span>18+ eligibility checked and current Live Rules accepted.</span></div>
          : liveEligibility?.age_blocked ? <div className="empty-state-box"><Shield size={24}/><strong>Public hosting unavailable</strong><p>This account did not meet the 18+ hosting requirement. Eligible viewers can still watch Live broadcasts.</p></div>
          : <div className="content-panel verification-policy"><h3>Public host requirements</h3><p>Creators must be at least 18 and accept the Live Rules. This is a self-declared age check, not government-ID verification. The full date is checked by the server and is not saved.</p>
            <label className="auth-label">Date of birth<input type="date" value={liveBirthDate} max={new Date().toISOString().slice(0,10)} onChange={e=>setLiveBirthDate(e.target.value)}/></label>
            <ul><li>No bullying, harassment, hate or threats.</li><li>No sexual content or promotion of dangerous or illegal activities.</li><li>Protect private information and do not impersonate others.</li><li>Only broadcast content you have permission to use.</li><li>No scams or deceptive promotions.</li></ul>
            <label className="setting-row"><input type="checkbox" checked={liveRulesAccepted} onChange={e=>setLiveRulesAccepted(e.target.checked)}/><span>I confirm I meet the 18+ requirement and accept the Gist-Up Live Rules.</span></label>
            <button className="primary-button" disabled={!liveBirthDate||!liveRulesAccepted||liveEligibilityBusy} onClick={submitLiveEligibility}>{liveEligibilityBusy?"Saving…":"Check eligibility and accept rules"}</button>
            {liveEligibilityError&&<p className="auth-error">{liveEligibilityError}</p>}
          </div>}
          {liveEligibility?.eligible&&<>
            <label className="auth-label">Broadcast title<input value={liveTitle} onChange={e=>setLiveTitle(e.target.value)} maxLength={100} placeholder="What are you going live about?"/></label>
            <div className="live-preview-frame">{liveStream?<video className="live-camera-video" autoPlay muted playsInline ref={el=>{if(el&&el.srcObject!==liveStream)el.srcObject=liveStream;}}/>:<div className="live-preview-placeholder"><Video size={30}/><strong>Camera preview</strong><span>Turn on your camera before starting.</span></div>}</div>
            <div className="live-setup-actions">{!liveStream?<button className="primary-button" onClick={prepareLiveCamera} disabled={liveCameraBusy}><Camera size={16}/>{liveCameraBusy?"Requesting…":"Turn on camera and microphone"}</button>:<button className="outline-button" onClick={stopLiveCamera}>Turn off camera</button>}<button className="primary-button" onClick={startPublicLive} disabled={!liveStream}>Start public Live</button></div>
          </>}
          <div className="section-title"><h3>Live now</h3><button className="outline-button compact" onClick={()=>fetch(API_BASE+"/api/public-live",{credentials:"include"}).then(r=>r.json()).then(d=>setPublicRooms(d.rooms||[])).catch(()=>{})}>Refresh</button></div>
          {!publicRooms.length?<div className="empty-state-box"><Video size={24}/><strong>No public broadcasts right now</strong><p>When creators go live, they will appear here.</p></div>:<div className="live-broadcast-list">{publicRooms.map(room=><div className="live-broadcast-row" key={room.id}><div><strong>{room.title}</strong><p>{room.host_name||room.host_username} · {room.viewer_count||0} watching</p></div><button className="primary-button compact" onClick={()=>joinPublicLive(room)}>Watch Live</button></div>)}</div>}
        </>:<>
          <div className="live-session-card">
            <div className="live-room-heading"><div><span className="welcome-pill">{publicRole==="host"?"YOU ARE LIVE":"WATCHING LIVE"}</span><h3>{publicRoom.title}</h3><p>{publicRole==="host"?"Your broadcast is running. Keep an eye on your audience and chat.":"You are watching this creator live."}</p></div><div className="live-room-viewer-total"><Users size={17}/><strong>{publicViewers.length}</strong><span>watching</span></div></div>
            {publicRole==="host"&&<section className="live-creator-dashboard" aria-label="Live creator dashboard"><div className="live-dashboard-heading"><div><span className="eyebrow">CREATOR STUDIO</span><h4>Live dashboard</h4></div><span className="live-status-pill"><i/> LIVE NOW</span></div><div className="live-dashboard-metrics"><div><span>Watching now</span><strong>{publicViewers.length}</strong></div><div><span>Total likes</span><strong>{publicLikesCount.toLocaleString()}</strong></div><div><span>Comments</span><strong>{publicMessages.filter(m=>m.type==="comment").length}</strong></div><div><span>Reactions</span><strong>{publicMessages.filter(m=>m.type==="reaction").length}</strong></div></div></section>}
            <div className="live-preview-frame live-interactive-frame" onPointerUp={handlePublicVideoTap} aria-label="Double-tap the video to like this Live"><div className="live-like-counter" aria-live="polite"><Heart size={17} fill="currentColor"/><strong>{publicLikesCount.toLocaleString()}</strong><span>likes</span></div>{publicLikePulse>0&&<span key={publicLikePulse} className="live-like-burst" aria-hidden="true">♥</span>}{publicRole==="host"&&liveStream?<video className="live-camera-video" autoPlay muted playsInline ref={el=>{if(el&&el.srcObject!==liveStream)el.srcObject=liveStream;}}/>:publicRemoteStream?<video className="live-camera-video" autoPlay playsInline ref={el=>{if(el&&el.srcObject!==publicRemoteStream)el.srcObject=publicRemoteStream;}}/>:<div className="live-preview-placeholder"><Video size={30}/><strong>{publicRole==="host"?"Your broadcast is live":"Connecting to creator…"}</strong></div>}<button type="button" className="live-viewer-like-button" onPointerUp={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();sendPublicLike();}} aria-label="Like this live broadcast"><Heart size={18} fill="currentColor"/> Like</button></div>
            <div className="live-like-actions"><button type="button" className="outline-button compact" onClick={sendPublicLike}><Heart size={15}/> Like</button><span>Double-tap the video to like</span></div>
            <div className="live-room-columns">
              <section className="live-audience-panel"><div className="live-panel-heading"><h4>Audience</h4><span>{publicViewers.length} viewers</span></div><div className="live-viewer-list">{publicViewers.length?publicViewers.map(person=><div className="live-viewer-row" key={person.id}><span>{person.full_name||person.username}</span>{publicRole==="host"&&<button className="outline-button compact" onClick={()=>moderatePublicLive("remove",person.id)}>Remove</button>}</div>):<p className="muted">Viewer names will appear here.</p>}</div></section>
              <section className="live-chat-panel"><div className="live-panel-heading"><h4>Live chat</h4><span>{publicCommentsEnabled?"Comments on":"Paused"}</span></div><div className="live-chat-messages">{publicMessages.map(msg=><p key={msg.id}><strong>{msg.full_name||msg.username||"Viewer"}:</strong> {msg.body}</p>)}</div>
                {publicCommentsEnabled?<div className="live-chat-compose"><input value={publicMessageText} maxLength={300} onChange={e=>setPublicMessageText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendPublicMessage("comment");}} placeholder="Write a comment…"/><button className="primary-button compact" onClick={()=>sendPublicMessage("comment")} disabled={!publicMessageText.trim()}>Send</button></div>:<p>Comments are paused by the host.</p>}
                <div className="live-reactions"><button className="outline-button compact" onClick={()=>sendPublicMessage("reaction","💜")}>💜</button><button className="outline-button compact" onClick={()=>sendPublicMessage("reaction","👏")}>👏</button><button className="outline-button compact" onClick={()=>sendPublicMessage("reaction","🔥")}>🔥</button></div>
              </section>
            </div>
            {publicRole==="host"?<div className="live-controls live-host-controls"><button className="outline-button" onClick={()=>moderatePublicLive("comments",null,!publicCommentsEnabled)}>{publicCommentsEnabled?"Pause comments":"Enable comments"}</button><button className="outline-button" onClick={()=>leavePublicLive(true)}>End Live</button></div>:<button className="outline-button" onClick={()=>leavePublicLive(false)}>Leave Live</button>}
          </div>
        </>}
        {publicError&&<p className="auth-error" role="alert">{publicError}</p>}
        <div className="live-safety-note"><ShieldCheck size={17}/><span>Hosts can pause comments, remove viewers and end broadcasts. Keep personal information private.</span></div>
        <p className="preview-note">Free-first WebRTC test, capped at four viewers per creator. Direct browser connections can fail on some networks. No unlimited audience or production-scale streaming is included.</p>
      </section>
      <section className="content-panel live-setup-panel"><div className="section-title"><h2>Private group video</h2><span className="welcome-pill">4-PERSON TEST</span></div>
        {!liveSession?<><label className="auth-label">Private room title<input value={liveTitle} onChange={e=>setLiveTitle(e.target.value)} maxLength={100}/></label><button className="outline-button" onClick={prepareLiveCamera} disabled={liveCameraBusy||!!liveStream}>{liveStream?"Camera ready":liveCameraBusy?"Requesting…":"Turn on camera and microphone"}</button><button className="outline-button" onClick={startPrivateLive} disabled={!liveStream}>Start private room</button><div className="live-join-box"><label className="auth-label">Invite code<input value={liveJoinCode} onChange={e=>setLiveJoinCode(e.target.value.toUpperCase().slice(0,8))} maxLength={8}/></label><button className="outline-button" onClick={joinPrivateLive} disabled={liveJoinCode.trim().length!==8||!liveStream}>Join private room</button></div></>:<div className="live-session-card live-battle-session"><div className="battle-topbar"><div><span className="eyebrow">GIST-UP LIVE ARENA</span><h3>{liveSession.title}</h3><p>2 vs 2 creator battle · {liveParticipants.length}/4 on stage</p></div><span className="battle-live-badge"><i/> LIVE ROOM</span></div><section className="battle-scoreboard" aria-label="Live battle scoreboard"><div className="battle-team-score battle-purple"><span>TEAM PURPLE</span><strong>{String(battleState?.purple_score || 0).padStart(2,"0")}</strong><small>{liveParticipants.slice(0,2).length}/2 players</small></div><div className="battle-versus">VS</div><div className="battle-team-score battle-pink"><span>TEAM PINK</span><strong>{String(battleState?.pink_score || 0).padStart(2,"0")}</strong><small>{liveParticipants.slice(2,4).length}/2 players</small></div></section><div className="battle-controls"><span className="battle-clock">{battleState?.status === "live" ? "BATTLE LIVE · " + Math.max(0,Math.ceil((new Date(battleState.ends_at).getTime()-Date.now())/1000)) + "s" : battleState?.status === "ended" ? "BATTLE FINISHED" : "READY WHEN ALL FOUR PLAYERS JOIN"}</span>{liveRole==="host"&&(!battleState||battleState.status==="waiting")&&<button className="primary-button" onClick={startBattle} disabled={battleBusy||liveParticipants.length!==4}>{battleBusy?"Starting…":"Start 3-minute battle"}</button>}{battleState?.status==="live"&&<button className="outline-button" onClick={sendBattleLike} disabled={battleBusy}>💜 Send team point</button>}</div><section className="battle-gifts-panel"><div className="battle-gifts-heading"><strong>🎁 Send a free cheer</strong><span>No coins · No purchase · No cash value</span></div><div className="battle-gift-buttons"><button type="button" onClick={()=>sendBattleGift("heart")} disabled={battleBusy||battleState?.status!=="live"}>💜 Heart <small>{battleGifts.find(g=>g.gift_type==="heart")?.total||0}</small></button><button type="button" onClick={()=>sendBattleGift("rose")} disabled={battleBusy||battleState?.status!=="live"}>🌹 Rose <small>{battleGifts.find(g=>g.gift_type==="rose")?.total||0}</small></button><button type="button" onClick={()=>sendBattleGift("star")} disabled={battleBusy||battleState?.status!=="live"}>⭐ Star <small>{battleGifts.find(g=>g.gift_type==="star")?.total||0}</small></button><button type="button" onClick={()=>sendBattleGift("fire")} disabled={battleBusy||battleState?.status!=="live"}>🔥 Fire <small>{battleGifts.find(g=>g.gift_type==="fire")?.total||0}</small></button></div><div className="battle-gift-feed" aria-live="polite">{recentBattleGifts.slice(0,4).map((gift,index)=><span key={gift.created_at+"-"+index}>{({heart:"💜",rose:"🌹",star:"⭐",fire:"🔥"})[gift.gift_type]} @{gift.username||"player"}</span>)}</div></section><div className="battle-stage-heading"><strong>THE BATTLE STAGE</strong><span>First two joiners · Purple &nbsp;|&nbsp; Next two · Pink</span></div><div className="live-participant-grid battle-participant-grid">{liveParticipants.map((person,index)=>{const self=String(person.id)===String(authUser?.id);const stream=self?liveStream:liveRemoteStreams[String(person.id)];const team=index<2?"purple":"pink";return <div className={"live-participant-tile battle-player-tile battle-player-"+team} key={person.id}><span className="battle-team-tag">{team==="purple"?"TEAM PURPLE":"TEAM PINK"}</span>{stream?<video className="live-camera-video" autoPlay muted={self} playsInline ref={el=>{if(el&&el.srcObject!==stream)el.srcObject=stream;}}/>:<span className="battle-connecting">Connecting video…</span>}<span className="battle-player-name">{self?"You":person.full_name||person.username}</span></div>;})}{Array.from({length:Math.max(0,4-liveParticipants.length)}).map((_,index)=><div className={"live-participant-tile battle-empty-slot "+(liveParticipants.length+index<2?"battle-player-purple":"battle-player-pink")} key={"empty-"+index}><span className="battle-team-tag">{liveParticipants.length+index<2?"TEAM PURPLE":"TEAM PINK"}</span><Users size={25}/><strong>Waiting for player</strong><small>Invite a teammate to fill this spot</small></div>)}</div><div className="battle-status-note"><span>⚡ GIST-UP BATTLE</span><p>Each participant is assigned to a team by join order. During the timed round, a team member can send a point for their team. The scoreboard is shared by everyone in this room.</p></div>{battleError&&<p className="auth-error" role="alert">{battleError}</p>}<button className="outline-button" onClick={endPrivateLive}>{liveRole==="host"?"End private room":"Leave private room"}</button></div>}
        {liveCameraError&&<p className="auth-error">{liveCameraError}</p>}
      </section>
    </div>;
  }
  function WalletPage() {
    const [walletTab, setWalletTab] = useState("Overview");
    const tabs = ["Overview", "Get Coins", "Gift history", "Creator earnings"];
    return <section className="wallet-page">
      <div className="wallet-preview-banner"><span className="wallet-preview-icon"><Wallet size={22}/></span><div><strong>Gist-Up Wallet preview</strong><p>This is a design preview. Purchases, transfers and withdrawals are not enabled.</p></div><span className="wallet-preview-pill">PREVIEW ONLY</span></div>
      <div className="wallet-balance-card"><div><span className="wallet-eyebrow">YOUR COIN BALANCE</span><div className="wallet-balance-number"><Coins size={30}/> 0 <small>Gist Coins</small></div><p>Your balance will appear here when the feature is officially available.</p></div><div className="wallet-balance-art">💜</div></div>
      <div className="wallet-tabs" role="tablist" aria-label="Wallet sections">{tabs.map(tab=><button type="button" role="tab" aria-selected={walletTab===tab} className={walletTab===tab?"active":""} onClick={()=>setWalletTab(tab)} key={tab}>{tab}</button>)}</div>
      {walletTab==="Overview"&&<><div className="wallet-section-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h3>Wallet overview</h3></div><History size={20}/></div><div className="wallet-overview-grid"><article><span>Coins received</span><strong>0</strong><small>No coin activity yet</small></article><article><span>Gifts sent</span><strong>0</strong><small>Free demo gifts are separate</small></article><article><span>Creator earnings</span><strong>Not available</strong><small>Monetisation is not active</small></article></div><div className="wallet-info-note"><ShieldCheck size={19}/><p><strong>Your account stays protected.</strong> Any future wallet feature will include eligibility checks, clear transaction records and safety controls.</p></div></>}
      {walletTab==="Get Coins"&&<><div className="wallet-section-heading"><div><span className="eyebrow">COIN PACKAGES</span><h3>Explore Gist Coins</h3></div><Coins size={20}/></div><div className="wallet-packages">{[{amount:"100",label:"Starter pack"},{amount:"500",label:"Creator pack"},{amount:"1,200",label:"Community pack"}].map((pack,index)=><article className={"wallet-package "+(index===1?"featured":"")} key={pack.amount}>{index===1&&<span className="wallet-popular">POPULAR PREVIEW</span>}<span className="wallet-package-coins"><Coins size={19}/>{pack.amount}</span><strong>{pack.label}</strong><small>Illustrative package · Price not set</small><button type="button" disabled>Purchases not available</button></article>)}</div><p className="wallet-footnote">These are sample package sizes for layout testing only. No payment method is connected and no purchase can be made.</p></>}
      {walletTab==="Gift history"&&<><div className="wallet-section-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h3>Gift history</h3></div><Gift size={20}/></div><div className="wallet-empty-state"><Gift size={28}/><strong>No coin gifts yet</strong><p>When eligible gifting features become available, your activity will appear here. Free Live Battle cheers remain separate.</p></div></>}
      {walletTab==="Creator earnings"&&<><div className="wallet-section-heading"><div><span className="eyebrow">CREATOR TOOLS</span><h3>Creator earnings</h3></div><BarChart3 size={20}/></div><div className="wallet-empty-state"><ShieldCheck size={28}/><strong>Earnings are not enabled</strong><p>There are no cash balances, withdrawals or payouts in this preview. Eligibility and adult-managed payment setup would be required before any future launch.</p></div></>}
    </section>;
  }
  const page = active==="Wallet"?<WalletPage/>:active==="Home"?<HomePage/>:active==="Live"?<LivePage/>:active==="Explore"?<ExplorePage/>:active==="Communities"?<CommunitiesPage/>:active==="Messages"?MessagesPage():active==="Notifications"?<NotificationsPage/>:active==="Saved"?<SavedPage/>:active==="Profile"?(selectedProfile?<OtherProfilePage/>:<ProfilePage/>):active==="Creator Studio"?<CreatorStudioPage/>:active==="Gisty AI"?<AssistantPage/>:active==="Image Studio"?<ImageStudioPage/>:active==="Ads Manager"?<AdsManagerPage/>:active==="Settings & Privacy"?<SettingsPage/>:<HomePage />;
  return <div className="app-shell">
    <header className="topbar"><button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X size={20}/>:<Menu size={20}/>}</button><button className="brand" onClick={()=>go("Home")}><span className="brand-mark"><img src="/gist-up-mark.svg" alt="" /></span><span>gist<span className="brand-up">up</span></span></button><label className="searchbox"><Search size={18}/><input aria-label="Search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")go("Explore")}} placeholder="Search people, topics, and communities"/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={()=>go("Notifications")}><Bell size={20}/><i/></button><button className="top-profile" onClick={()=>go("Profile")}><Avatar initials={myInitials} size="small" imageUrl={authUser?.avatar_url}/><span className="profile-name">{displayName} {authUser?.is_verified&&<VerifiedBadge size={13}/>}</span></button></div></header>
    {notice&&<div className="toast" role="status">{notice}</div>}
    <div className="layout"><aside className={"left-sidebar "+(mobileNav?"open":"")}><button className="nav-item sidebar-create" onClick={()=>{setComposerOpen(true);setMobileNav(false);}}><Plus size={19}/><span>Create post</span></button>{sidebarGroups.map(group=><section className="sidebar-group" key={group.title}><div className="sidebar-label">{group.title}</div>{group.items.map(({label,display,icon:Icon})=><button key={label} className={"nav-item "+(active===label?"selected":"")} onClick={()=>go(label)}><Icon size={19}/><span>{display||label}</span>{label==="Notifications"&&notifications.some(item=>!item.is_read)&&<b className="nav-count">{notifications.filter(item=>!item.is_read).length}</b>}</button>)}</section>)}<div className="sidebar-card"><strong>Make your space yours</strong><p>Find your people and join conversations that matter to you.</p><button onClick={()=>go("Explore")}>Explore Gist Up <ArrowRight size={14}/></button></div><div className="sidebar-footer">About · Guidelines · Privacy<p>© 2026 Gist Up</p><button className="text-button" onClick={signOut}><LogOut size={13}/> Sign out</button></div></aside>
    <main className="feed-column"><HeaderTitle/>{page}</main>
    <aside className="right-sidebar"><section className="right-card profile-card"><div className="profile-cover"/><div className="profile-card-body"><Avatar initials={myInitials} size="large" imageUrl={authUser?.avatar_url}/><strong>{displayName} {authUser?.is_verified&&<VerifiedBadge size={14}/>}</strong><span>{handle}</span><p>{profileBio}</p><div className="profile-metrics"><div><b>{following.length}</b><span>Following</span></div><div><b>{followerCount}</b><span>Followers</span></div><div><b>{posts.filter(p=>p.handle===handle).length}</b><span>Posts</span></div></div><button className="outline-button" onClick={()=>go("Profile")}>View profile</button></div></section><section className="right-card trends-card"><div className="right-card-heading"><h3><TrendingUp size={17}/> What's happening</h3><button onClick={()=>go("Explore")}>See all</button></div>{trendingTopics.slice(0,3).map(([tag,count,category])=><button className="trend-row" key={tag} onClick={()=>{setQuery(tag);go("Explore")}}><span>{category} · From posts</span><strong>{tag}</strong><small>{count}</small></button>)}{!trendingTopics.length&&<p className="muted">Hashtags from published posts will appear here.</p>}</section><section className="right-card suggestions-card"><div className="right-card-heading"><h3>People to know</h3><button onClick={()=>go("Explore")}>See all</button></div>{people.slice(0,3).map(p=><div className="suggestion-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone} imageUrl={p.avatar_url}/><div className="suggestion-info"><strong>{p.name}</strong><span>{p.handle}</span></div><button className="follow-button" onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}</section><footer className="right-footer">About · Help · Community Guidelines<br/>Privacy · Terms · Cookies<br/><span>© 2026 Gist Up</span></footer></aside></div>
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      <button className={active==="Home"?"mobile-nav-item active":"mobile-nav-item"} aria-current={active==="Home"?"page":undefined} onClick={()=>go("Home")}><Home size={21}/><span>Home</span></button>
      <button className={active==="Explore"?"mobile-nav-item active":"mobile-nav-item"} aria-current={active==="Explore"?"page":undefined} onClick={()=>go("Explore")}><Compass size={21}/><span>Explore</span></button>
      <button className="mobile-nav-create" aria-label="Create a post" onClick={()=>{setComposerOpen(true);setMobileNav(false);}}><Plus size={25}/><span>Create</span></button>
      <button className={active==="Messages"?"mobile-nav-item active":"mobile-nav-item"} aria-current={active==="Messages"?"page":undefined} onClick={()=>go("Messages")}><MessageCircle size={21}/><span>Messages</span></button>
      <button className={active==="Profile"?"mobile-nav-item active":"mobile-nav-item"} aria-current={active==="Profile"?"page":undefined} onClick={()=>go("Profile")}><UserRound size={21}/><span>Profile</span></button>
    </nav>
    {composerOpen&&<div className="modal-backdrop" onClick={()=>setComposerOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="composer-title">Create a post</h2><button className="icon-button" aria-label="Close" onClick={()=>setComposerOpen(false)}><X size={20}/></button></div><div className="modal-user"><Avatar initials={myInitials} size="medium" imageUrl={authUser?.avatar_url}/><div><strong>{displayName} {authUser?.is_verified&&<VerifiedBadge size={14}/>}</strong><span>Sharing with everyone</span></div></div><p className="composer-hint">Share a thought, ask a question, or add a photo or short video.</p><textarea autoFocus value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Write your post here..." aria-label="Write your post" maxLength={5000}/>{postImageData && <div className="post-image-preview"><img src={postImageData} alt="Selected post attachment"/><button className="icon-button" aria-label="Remove selected image" onClick={()=>setPostImageData("")}><X size={16}/></button></div>}{postVideoData && <div className="post-image-preview"><video className="post-video-preview" src={postVideoData} controls playsInline/><button className="icon-button" aria-label="Remove selected video" onClick={()=>setPostVideoData("")}><X size={16}/></button></div>}<div className="composer-media-tools"><label className="outline-button compact image-pick-button"><ImageIcon size={16}/> Add a photo<input type="file" accept="image/*" hidden onChange={e=>handleImagePick(e,"post")}/></label><label className="outline-button compact image-pick-button"><Paperclip size={16}/> Add a video<input type="file" accept="video/mp4,video/webm" hidden onChange={handleVideoPick}/></label><span>Videos: MP4 or WebM, up to 10 MB.</span></div><div className="modal-bottom"><span>{postText.length}/5000</span><button className="primary-button" disabled={(!postText.trim()&&!postImageData&&!postVideoData)||postBusy} onClick={publish}>{postBusy?"Publishing…":"Publish post"} <ArrowRight size={16}/></button></div><p className="preview-note">Your post will be saved to your Gist Up account.</p></section></div>}
    {reportPost&&<div className="modal-backdrop" onClick={()=>setReportPost(null)}><section className="composer-modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="report-title">Report post</h2><button className="icon-button" aria-label="Close report dialog" onClick={()=>setReportPost(null)}><X size={20}/></button></div><p className="muted">Tell us why this post may violate Gist Up's community guidelines. Reports are saved for review.</p><label className="auth-label">Reason<select value={reportReason} onChange={e=>setReportReason(e.target.value)}><option>Spam</option><option>Harassment or bullying</option><option>Hate or abuse</option><option>False information</option><option>Other</option></select></label><label className="auth-label">Additional details (optional)<textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} maxLength={500} placeholder="Share any context that may help the review."/></label><button className="primary-button auth-main-btn" onClick={submitReport} disabled={reportBusy}>{reportBusy?"Sending report…":"Submit report"} <ArrowRight size={16}/></button></section></div>}
    {commentPost!==null&&<div className="modal-backdrop" onClick={()=>setCommentPost(null)}><section className="composer-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Comments</h2><button className="icon-button" onClick={()=>setCommentPost(null)}><X size={20}/></button></div><p className="muted">Comments are saved to this post.</p><div className="post-comments-list">{commentsBusy?<p className="muted">Loading comments…</p>:postComments.length?postComments.map(comment=><div className="saved-comment" key={comment.id}><strong>{comment.full_name || comment.username}</strong><p>{comment.content}</p><small>{new Date(comment.created_at).toLocaleString()}</small></div>):<p className="muted">No comments yet. Start the conversation.</p>}</div><div className="comment-input"><input value={commentText} onChange={e=>setCommentText(e.target.value)} maxLength={2000} placeholder="Write a comment…"/><button className="primary-button" onClick={submitComment} disabled={!commentText.trim()}><Send size={15}/></button></div></section></div>}
    {editProfile&&<div className="modal-backdrop" onClick={()=>setEditProfile(false)}><section className="composer-modal edit-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Edit profile</h2><button className="icon-button" onClick={()=>setEditProfile(false)}><X size={20}/></button></div><label className="auth-label">Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={50}/></label><label className="auth-label">Username<input value={handle} onChange={e=>setHandle(e.target.value.startsWith("@")?e.target.value:"@"+e.target.value)} maxLength={30}/></label><label className="auth-label">Bio<textarea value={profileBio} onChange={e=>setProfileBio(e.target.value)} maxLength={160}/></label><div className="image-edit-row"><div className="image-edit-preview"><Avatar initials={myInitials} size="medium" imageUrl={avatarImageData || authUser?.avatar_url}/><span>Profile picture</span></div><label className="outline-button compact image-pick-button"><Camera size={14}/> Choose picture<input type="file" accept="image/*" hidden onChange={e=>handleImagePick(e,"avatar")}/></label></div>{coverImageData && <p className="preview-note">New cover photo selected. Save changes to apply it.</p>}{avatarImageData && <p className="preview-note">New profile picture selected. Save changes to apply it.</p>}<button className="primary-button auth-main-btn" onClick={saveProfile}><Check size={16}/> Save changes</button><p className="preview-note">Your display name, username, and bio will be saved to your account.</p></section></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);