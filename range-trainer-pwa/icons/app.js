// Range Trainer — standalone build (no bundler). React/ReactDOM are loaded
// as globals via <script> tags in index.html; this file is compiled with
// Babel (JSX only, no modules) into app.js at build time.
const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Fragment
} = React;

// ---- tiny local storage wrapper (mirrors the artifact window.storage API)
const storage = {
  async get(key) {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : {
      value: raw
    };
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return {
        value
      };
    } catch (e) {
      return null;
    }
  }
};

// ---- minimal lucide-style icon set (no icon package dependency) ---------
function makeIcon(children) {
  return function Icon({
    size = 16,
    color = "currentColor",
    style
  }) {
    return /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: style
    }, children);
  };
}
const ChevronLeft = makeIcon(/*#__PURE__*/React.createElement("polyline", {
  points: "15 18 9 12 15 6"
}));
const X = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
})));
const Download = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 3v12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "7 10 12 15 17 10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 21h14"
})));
const BarChart3 = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "20",
  x2: "4",
  y2: "10"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "20",
  x2: "12",
  y2: "4"
}), /*#__PURE__*/React.createElement("line", {
  x1: "20",
  y1: "20",
  x2: "20",
  y2: "14"
})));
const RotateCcw = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 3-6.7"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "3 3 3 9 9 9"
})));
const Flag = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 21V4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 4h12l-2 4 2 4H4"
})));
const Undo2 = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 14 4 9l5-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 9h11a5 5 0 0 1 0 10h-1"
})));
const Settings = makeIcon(/*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "6",
  x2: "20",
  y2: "6"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "6",
  r: "2"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "12",
  x2: "20",
  y2: "12"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "15",
  cy: "12",
  r: "2"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "18",
  x2: "20",
  y2: "18"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "18",
  r: "2"
})));

// ---- Palette (fairway-at-dusk / scorecard) -------------------------------
const C = {
  turf: "#16281F",
  // background
  turfDeep: "#0F1E17",
  // deepest background
  card: "#213B2E",
  // panel surface
  cardLine: "#345043",
  // hairlines / dividers
  chalk: "#EDE7D9",
  // primary text
  chalkDim: "#A9B7AC",
  // secondary text
  gold: "#D9A93C",
  // great
  sage: "#7FA687",
  // decent
  amber: "#C97A3D",
  // stinger
  flag: "#BD4438" // topped
};
const QUALITIES = [{
  key: "great",
  label: "Great",
  color: C.gold,
  hint: "Flush & on line"
}, {
  key: "decent",
  label: "Decent",
  color: C.sage,
  hint: "Solid enough"
}, {
  key: "stinger",
  label: "Stinger",
  color: C.amber,
  hint: "Low & punchy"
}, {
  key: "topped",
  label: "Topped",
  color: C.flag,
  hint: "Thin / heavy"
}];
const DEFAULT_CLUBS = ["Driver", "3W", "5W", "3H", "4H", "3i", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW", "Putter"];
const STORAGE_KEY = "range-trainer-swings";
const CLUBS_STORAGE_KEY = "range-trainer-clubs";
function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}
function loadFont() {
  return /*#__PURE__*/React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
      .rt-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
      .rt-body { font-family: 'Inter', sans-serif; }
      .rt-mono { font-family: 'JetBrains Mono', monospace; }
    `);
}

// Tally mark rendered as a little scorecard hash — the signature element.
function TallyGroup({
  count,
  color
}) {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  const strokes = (n, keyPrefix) => /*#__PURE__*/React.createElement("svg", {
    width: n === 5 ? 26 : Math.max(n * 5, 4),
    height: "18",
    viewBox: `0 0 ${n === 5 ? 26 : n * 5} 18`
  }, Array.from({
    length: Math.min(n, 4)
  }).map((_, i) => /*#__PURE__*/React.createElement("line", {
    key: `${keyPrefix}-${i}`,
    x1: 4 + i * 6,
    y1: "2",
    x2: 4 + i * 6,
    y2: "16",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round"
  })), n === 5 && /*#__PURE__*/React.createElement("line", {
    x1: "1",
    y1: "16",
    x2: "23",
    y2: "2",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }));
  if (count === 0) return /*#__PURE__*/React.createElement("span", {
    className: "rt-mono",
    style: {
      color: C.chalkDim,
      fontSize: 13
    }
  }, "—");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap"
    }
  }, Array.from({
    length: groups
  }).map((_, i) => /*#__PURE__*/React.createElement(Fragment, {
    key: i
  }, strokes(5, `g${i}`))), remainder > 0 && strokes(remainder, "r"));
}

// Horizontal stacked bar per club — replaces Recharts' BarChart.
function ClubBreakdownChart({
  data
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(1, ...data.map(d => d.great + d.decent + d.stinger + d.topped));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, data.map(d => {
    const total = d.great + d.decent + d.stinger + d.topped;
    return /*#__PURE__*/React.createElement("div", {
      key: d.club,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "rt-mono",
      style: {
        width: 38,
        color: C.chalk,
        fontSize: 12,
        flexShrink: 0
      }
    }, d.club), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        height: 16,
        borderRadius: 4,
        overflow: "hidden",
        background: C.card
      }
    }, QUALITIES.map(q => {
      const val = d[q.key];
      if (!val) return null;
      return /*#__PURE__*/React.createElement("div", {
        key: q.key,
        title: `${q.label}: ${val}`,
        style: {
          width: `${val / max * 100}%`,
          background: q.color
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      className: "rt-mono",
      style: {
        width: 22,
        textAlign: "right",
        color: C.chalkDim,
        fontSize: 11,
        flexShrink: 0
      }
    }, total));
  }));
}

// Vertical stacked bars over time — replaces Recharts' trend BarChart.
function TrendChart({
  data
}) {
  if (!data || data.length < 2) return null;
  const max = Math.max(1, ...data.map(d => d.total));
  const barMaxHeight = 130;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 5,
      height: barMaxHeight + 30,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.day,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
      width: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    title: `${d.label}: ${d.total} swings`,
    style: {
      display: "flex",
      flexDirection: "column-reverse",
      width: 14,
      height: barMaxHeight,
      borderRadius: 3,
      overflow: "hidden",
      background: C.card
    }
  }, QUALITIES.map(q => {
    const val = d[q.key];
    if (!val) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: q.key,
      style: {
        height: `${val / max * barMaxHeight}px`,
        background: q.color,
        width: "100%"
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    className: "rt-mono",
    style: {
      fontSize: 8,
      color: C.chalkDim,
      marginTop: 4,
      whiteSpace: "nowrap"
    }
  }, d.label))));
}
function RangeTrainer() {
  const [loading, setLoading] = useState(true);
  const [swings, setSwings] = useState([]); // {id, club, quality, ts, sessionId}
  const [clubs, setClubs] = useState(DEFAULT_CLUBS);
  const [screen, setScreen] = useState("club-select"); // club-select | active | summary
  const [selectedClub, setSelectedClub] = useState(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsScope, setStatsScope] = useState("all"); // 'today' | 'all'
  const [showSettings, setShowSettings] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const [saveError, setSaveError] = useState(false);

  // ---- load persisted swings & clubs -------------------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await storage.get(STORAGE_KEY);
        if (mounted && result?.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed)) setSwings(parsed);
        }
      } catch (e) {
        // key not found on first run — fine, start empty
      }
      try {
        const clubResult = await storage.get(CLUBS_STORAGE_KEY);
        if (mounted && clubResult?.value) {
          const parsedClubs = JSON.parse(clubResult.value);
          if (Array.isArray(parsedClubs) && parsedClubs.length > 0) setClubs(parsedClubs);
        }
      } catch (e) {
        // no custom club list saved yet — use defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const persist = useCallback(async next => {
    try {
      const result = await storage.set(STORAGE_KEY, JSON.stringify(next));
      if (!result) setSaveError(true);else setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, []);
  const persistClubs = useCallback(async next => {
    try {
      await storage.set(CLUBS_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // best-effort; club list will just fall back to last-known state in memory
    }
  }, []);
  const addClub = () => {
    const name = newClubName.trim();
    if (!name) return;
    if (clubs.some(c => c.toLowerCase() === name.toLowerCase())) {
      setNewClubName("");
      return;
    }
    const next = [...clubs, name];
    setClubs(next);
    persistClubs(next);
    setNewClubName("");
  };
  const removeClub = name => {
    const next = clubs.filter(c => c !== name);
    setClubs(next);
    persistClubs(next);
    if (selectedClub === name) {
      setSelectedClub(null);
      setScreen("club-select");
    }
  };
  const recordSwing = quality => {
    const swing = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      club: selectedClub,
      quality,
      ts: Date.now(),
      sessionId: sessionStart
    };
    const next = [...swings, swing];
    setSwings(next);
    persist(next);
    setShowQualityModal(false);
  };
  const sessionSwings = useMemo(() => swings.filter(s => s.ts >= sessionStart), [swings, sessionStart]);
  const lastSessionSwing = useMemo(() => {
    if (sessionSwings.length === 0) return null;
    return sessionSwings.reduce((a, b) => a.ts > b.ts ? a : b);
  }, [sessionSwings]);
  const undoLastSwing = () => {
    if (!lastSessionSwing) return;
    const next = swings.filter(s => s.id !== lastSessionSwing.id);
    setSwings(next);
    persist(next);
  };
  const clubSessionSwings = useMemo(() => sessionSwings.filter(s => s.club === selectedClub), [sessionSwings, selectedClub]);
  const clubTally = useMemo(() => {
    const t = {
      great: 0,
      decent: 0,
      stinger: 0,
      topped: 0
    };
    clubSessionSwings.forEach(s => t[s.quality] = (t[s.quality] || 0) + 1);
    return t;
  }, [clubSessionSwings]);
  const sessionTallyByClub = useMemo(() => {
    const map = {};
    sessionSwings.forEach(s => {
      if (!map[s.club]) map[s.club] = {
        great: 0,
        decent: 0,
        stinger: 0,
        topped: 0
      };
      map[s.club][s.quality]++;
    });
    return map;
  }, [sessionSwings]);
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const scopedSwings = useMemo(() => {
    if (statsScope === "today") return swings.filter(s => s.ts >= startOfToday);
    return swings;
  }, [swings, statsScope, startOfToday]);
  const scopedTally = useMemo(() => {
    const t = {
      great: 0,
      decent: 0,
      stinger: 0,
      topped: 0
    };
    scopedSwings.forEach(s => t[s.quality] = (t[s.quality] || 0) + 1);
    return t;
  }, [scopedSwings]);
  const chartData = useMemo(() => {
    const map = {};
    scopedSwings.forEach(s => {
      if (!map[s.club]) map[s.club] = {
        club: s.club,
        great: 0,
        decent: 0,
        stinger: 0,
        topped: 0
      };
      map[s.club][s.quality]++;
    });
    const known = clubs.filter(c => map[c]);
    const retired = Object.keys(map).filter(c => !clubs.includes(c));
    return [...known, ...retired].map(c => map[c]);
  }, [scopedSwings, clubs]);
  const dailyTrend = useMemo(() => {
    const map = {};
    swings.forEach(s => {
      const day = new Date(s.ts).toISOString().slice(0, 10);
      if (!map[day]) map[day] = {
        day,
        great: 0,
        decent: 0,
        stinger: 0,
        topped: 0,
        total: 0
      };
      map[day][s.quality]++;
      map[day].total++;
    });
    const days = Object.keys(map).sort();
    const trimmed = days.slice(-30);
    return trimmed.map(d => ({
      ...map[d],
      label: new Date(d + "T00:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      })
    }));
  }, [swings]);
  const exportCSV = () => {
    const header = "date,time,club,quality\n";
    const rows = swings.slice().sort((a, b) => a.ts - b.ts).map(s => {
      const d = new Date(s.ts);
      return `${d.toISOString().slice(0, 10)},${d.toTimeString().slice(0, 8)},${s.club},${s.quality}`;
    }).join("\n");
    const blob = new Blob([header + rows], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `range-trainer-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const startNewSession = () => {
    setSessionStart(Date.now());
    setSelectedClub(null);
    setScreen("club-select");
  };
  const totalAllTime = swings.length;

  // ---- shared chrome ------------------------------------------------------
  const AppBar = ({
    title,
    onBack
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px",
      borderBottom: `1px solid ${C.cardLine}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 40
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: iconBtnStyle
  }, /*#__PURE__*/React.createElement(ChevronLeft, {
    size: 20,
    color: C.chalk
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 18,
      fontWeight: 600,
      textTransform: "uppercase"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSettings(true),
    style: iconBtnStyle
  }, /*#__PURE__*/React.createElement(Settings, {
    size: 19,
    color: C.chalk
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStats(true),
    style: iconBtnStyle
  }, /*#__PURE__*/React.createElement(BarChart3, {
    size: 20,
    color: C.chalk
  }))));
  const iconBtnStyle = {
    background: "none",
    border: "none",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
    minWidth: 40,
    display: "flex",
    justifyContent: "center"
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...outerStyle,
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "rt-body",
      style: {
        color: C.chalkDim,
        fontSize: 14
      }
    }, "Loading your range history…"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: outerStyle
  }, loadFont(), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 420,
      background: C.turf,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      border: `1px solid ${C.cardLine}`
    }
  }, screen === "club-select" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    title: "Range Trainer"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 6px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, formatDate(sessionStart)), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      marginTop: 2
    }
  }, totalAllTime > 0 ? `${totalAllTime} swings logged all-time` : "Pick a club to start your session")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 10,
      padding: 18
    }
  }, clubs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      gridColumn: "1 / -1",
      color: C.chalkDim,
      fontSize: 13,
      textAlign: "center",
      padding: "20px 0"
    }
  }, "No clubs in your bag yet — add some in settings."), clubs.map(club => {
    const clubAllTimeCount = swings.filter(s => s.club === club).length;
    return /*#__PURE__*/React.createElement("button", {
      key: club,
      onClick: () => {
        setSelectedClub(club);
        setScreen("active");
      },
      className: "rt-display",
      style: {
        background: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 12,
        padding: "16px 4px",
        color: C.chalk,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4
      }
    }, club, /*#__PURE__*/React.createElement("span", {
      className: "rt-mono",
      style: {
        fontSize: 10,
        color: C.chalkDim,
        fontWeight: 500
      }
    }, clubAllTimeCount > 0 ? clubAllTimeCount : "\u00A0"));
  }))), screen === "active" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    title: selectedClub,
    onBack: () => setScreen("club-select")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 20px 8px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, formatDate(sessionStart)), /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 40,
      fontWeight: 700,
      marginTop: 2
    }
  }, clubSessionSwings.length), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 11,
      marginTop: -2
    }
  }, "swings this session")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, QUALITIES.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.key,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-body",
    style: {
      color: q.color,
      fontSize: 13,
      fontWeight: 600
    }
  }, q.label), /*#__PURE__*/React.createElement(TallyGroup, {
    count: clubTally[q.key] || 0,
    color: q.color
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 20px 8px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowQualityModal(true),
    className: "rt-display",
    style: {
      width: "100%",
      padding: "22px 0",
      background: C.gold,
      border: "none",
      borderRadius: 16,
      color: C.turfDeep,
      fontSize: 22,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      cursor: "pointer"
    }
  }, "I hit it")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px 8px",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: undoLastSwing,
    disabled: !lastSessionSwing,
    className: "rt-body",
    style: {
      background: "none",
      border: "none",
      color: lastSessionSwing ? C.chalkDim : "transparent",
      fontSize: 12,
      cursor: lastSessionSwing ? "pointer" : "default",
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 4px",
      pointerEvents: lastSessionSwing ? "auto" : "none"
    }
  }, /*#__PURE__*/React.createElement(Undo2, {
    size: 13
  }), lastSessionSwing ? `Undo last: ${lastSessionSwing.club} · ${QUALITIES.find(q => q.key === lastSessionSwing.quality)?.label}` : "\u00A0")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 20px 20px",
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen("club-select"),
    className: "rt-body",
    style: {
      flex: 1,
      padding: "12px 0",
      background: "transparent",
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      color: C.chalkDim,
      fontSize: 14,
      cursor: "pointer"
    }
  }, "Switch club"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen("summary"),
    className: "rt-body",
    style: {
      flex: 1,
      padding: "12px 0",
      background: "transparent",
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      color: C.chalkDim,
      fontSize: 14,
      cursor: "pointer"
    }
  }, "End session"))), screen === "summary" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    title: "Session Summary",
    onBack: () => setScreen("active")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, formatDate(sessionStart)), /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 30,
      fontWeight: 700,
      marginTop: 2
    }
  }, sessionSwings.length, " swings"), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      marginBottom: 6
    }
  }, "across ", Object.keys(sessionTallyByClub).length, " club", Object.keys(sessionTallyByClub).length === 1 ? "" : "s"), lastSessionSwing && /*#__PURE__*/React.createElement("button", {
    onClick: undoLastSwing,
    className: "rt-body",
    style: {
      background: "none",
      border: "none",
      color: C.chalkDim,
      fontSize: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "0 0 12px"
    }
  }, /*#__PURE__*/React.createElement(Undo2, {
    size: 13
  }), "Undo last: ", lastSessionSwing.club, " · ", QUALITIES.find(q => q.key === lastSessionSwing.quality)?.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, Object.entries(sessionTallyByClub).map(([club, t]) => /*#__PURE__*/React.createElement("div", {
    key: club,
    style: {
      background: C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 6
    }
  }, club), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap"
    }
  }, QUALITIES.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.key,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 4,
      background: q.color,
      display: "inline-block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rt-mono",
    style: {
      color: C.chalkDim,
      fontSize: 12
    }
  }, t[q.key] || 0))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: startNewSession,
    className: "rt-body",
    style: {
      flex: 1,
      padding: "13px 0",
      background: C.gold,
      border: "none",
      borderRadius: 10,
      color: C.turfDeep,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 15
  }), " New session"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStats(true),
    className: "rt-body",
    style: {
      flex: 1,
      padding: "13px 0",
      background: "transparent",
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      color: C.chalkDim,
      fontSize: 14,
      cursor: "pointer"
    }
  }, "View all-time stats"))))), showQualityModal && /*#__PURE__*/React.createElement("div", {
    style: overlayStyle,
    onClick: () => setShowQualityModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: 420,
      background: C.turfDeep,
      borderRadius: "20px 20px 0 0",
      padding: "22px 18px 28px",
      border: `1px solid ${C.cardLine}`,
      borderBottom: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: C.cardLine
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 16
    }
  }, "How'd that ", selectedClub, " go?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, QUALITIES.map(q => /*#__PURE__*/React.createElement("button", {
    key: q.key,
    onClick: () => recordSwing(q.key),
    className: "rt-display",
    style: {
      padding: "20px 8px",
      borderRadius: 14,
      border: `2px solid ${q.color}`,
      background: `${q.color}22`,
      color: q.color,
      fontSize: 17,
      fontWeight: 700,
      textTransform: "uppercase",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, q.label, /*#__PURE__*/React.createElement("span", {
    className: "rt-body",
    style: {
      fontSize: 10,
      color: C.chalkDim,
      fontWeight: 500,
      textTransform: "none"
    }
  }, q.hint)))))), showStats && /*#__PURE__*/React.createElement("div", {
    style: overlayStyle,
    onClick: () => setShowStats(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: 420,
      maxHeight: "85vh",
      overflowY: "auto",
      background: C.turf,
      borderRadius: 18,
      padding: 0,
      border: `1px solid ${C.cardLine}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px",
      borderBottom: `1px solid ${C.cardLine}`,
      position: "sticky",
      top: 0,
      background: C.turf,
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 16,
      fontWeight: 600,
      textTransform: "uppercase"
    }
  }, /*#__PURE__*/React.createElement(Flag, {
    size: 15,
    style: {
      display: "inline",
      marginRight: 6,
      verticalAlign: -2
    },
    color: C.gold
  }), "Stats"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStats(false),
    style: iconBtnStyle
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.chalkDim,
      fontSize: 20
    }
  }, "×"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      padding: 3,
      marginBottom: 16
    }
  }, [{
    key: "today",
    label: "Today"
  }, {
    key: "all",
    label: "All time"
  }].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.key,
    onClick: () => setStatsScope(opt.key),
    className: "rt-body",
    style: {
      flex: 1,
      padding: "9px 0",
      background: statsScope === opt.key ? C.gold : "transparent",
      border: "none",
      borderRadius: 8,
      color: statsScope === opt.key ? C.turfDeep : C.chalkDim,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, opt.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 34,
      fontWeight: 700
    }
  }, scopedSwings.length), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 12,
      marginBottom: 10
    }
  }, "swings ", statsScope === "today" ? "today" : "all-time"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap"
    }
  }, QUALITIES.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.key,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 4,
      background: q.color,
      display: "inline-block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 12
    }
  }, q.label), /*#__PURE__*/React.createElement("span", {
    className: "rt-mono",
    style: {
      color: C.chalk,
      fontSize: 12,
      fontWeight: 600
    }
  }, scopedTally[q.key] || 0))))), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 8
    }
  }, "By club"), chartData.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      textAlign: "center",
      padding: "20px 0"
    }
  }, statsScope === "today" ? "No swings logged today yet." : "No swings logged yet — get out on the range.") : /*#__PURE__*/React.createElement(ClubBreakdownChart, {
    data: chartData
  }), /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      margin: "22px 0 8px"
    }
  }, "Over time"), dailyTrend.length < 2 ? /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      textAlign: "center",
      padding: "16px 0"
    }
  }, "Log swings on a few different days to see a trend.") : /*#__PURE__*/React.createElement(TrendChart, {
    data: dailyTrend
  }), /*#__PURE__*/React.createElement("button", {
    onClick: exportCSV,
    disabled: swings.length === 0,
    className: "rt-body",
    style: {
      width: "100%",
      marginTop: 20,
      padding: "13px 0",
      background: swings.length === 0 ? C.card : C.gold,
      border: "none",
      borderRadius: 10,
      color: swings.length === 0 ? C.chalkDim : C.turfDeep,
      fontSize: 14,
      fontWeight: 600,
      cursor: swings.length === 0 ? "default" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Download, {
    size: 15
  }), " Export CSV"), saveError && /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.flag,
      fontSize: 11,
      textAlign: "center",
      marginTop: 8
    }
  }, "Couldn't save last update — your data may not persist.")))), showSettings && /*#__PURE__*/React.createElement("div", {
    style: overlayStyle,
    onClick: () => setShowSettings(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: 420,
      maxHeight: "85vh",
      overflowY: "auto",
      background: C.turf,
      borderRadius: 18,
      padding: 0,
      border: `1px solid ${C.cardLine}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px",
      borderBottom: `1px solid ${C.cardLine}`,
      position: "sticky",
      top: 0,
      background: C.turf
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 16,
      fontWeight: 600,
      textTransform: "uppercase"
    }
  }, /*#__PURE__*/React.createElement(Settings, {
    size: 15,
    style: {
      display: "inline",
      marginRight: 6,
      verticalAlign: -2
    },
    color: C.gold
  }), "Edit your bag"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSettings(false),
    style: iconBtnStyle
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.chalkDim,
      fontSize: 20
    }
  }, "×"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 12,
      marginBottom: 12
    }
  }, "Only clubs you actually carry show up on the picker screen. Removing a club here doesn't touch any swings you've already logged with it."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 16
    }
  }, clubs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "rt-body",
    style: {
      color: C.chalkDim,
      fontSize: 13,
      textAlign: "center",
      padding: "10px 0"
    }
  }, "Your bag is empty — add a club below."), clubs.map(club => /*#__PURE__*/React.createElement("div", {
    key: club,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-display",
    style: {
      color: C.chalk,
      fontSize: 15,
      fontWeight: 600
    }
  }, club), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeClub(club),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4,
      display: "flex"
    },
    "aria-label": `Remove ${club}`
  }, /*#__PURE__*/React.createElement(X, {
    size: 16,
    color: C.flag
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: newClubName,
    onChange: e => setNewClubName(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") addClub();
    },
    placeholder: "e.g. 4W, 2H, 60° wedge",
    className: "rt-body",
    style: {
      flex: 1,
      background: C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      padding: "11px 12px",
      color: C.chalk,
      fontSize: 14,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addClub,
    disabled: !newClubName.trim(),
    className: "rt-body",
    style: {
      padding: "0 18px",
      background: newClubName.trim() ? C.gold : C.card,
      border: `1px solid ${C.cardLine}`,
      borderRadius: 10,
      color: newClubName.trim() ? C.turfDeep : C.chalkDim,
      fontSize: 14,
      fontWeight: 600,
      cursor: newClubName.trim() ? "pointer" : "default"
    }
  }, "Add"))))));
}
const outerStyle = {
  minHeight: "100vh",
  width: "100%",
  background: `radial-gradient(circle at 50% 0%, #1D3527 0%, ${C.turfDeep} 70%)`,
  display: "flex",
  justifyContent: "center",
  padding: "20px 12px",
  boxSizing: "border-box"
};
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 50
};
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(RangeTrainer, null));