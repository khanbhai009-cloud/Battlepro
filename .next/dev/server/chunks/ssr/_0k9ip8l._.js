module.exports = [
"[project]/lib/firebase-admin.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAdminApp",
    ()=>getAdminApp,
    "getAdminAuth",
    ()=>getAdminAuth,
    "getAdminDb",
    ()=>getAdminDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs, [project]/node_modules/firebase-admin)");
;
let adminApp = null;
function getAdminApp() {
    if (!adminApp) {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["apps"].length > 0) {
            adminApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["apps"][0];
        } else {
            const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!serviceAccountStr) {
                console.warn("FIREBASE_SERVICE_ACCOUNT not set. Firebase Admin features will fail.");
                return null;
            }
            try {
                const serviceAccount = JSON.parse(serviceAccountStr);
                adminApp = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"]({
                    credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["credential"].cert(serviceAccount)
                });
            } catch (e) {
                console.error("Firebase Admin Init Error:", e);
                return null;
            }
        }
    }
    return adminApp;
}
function getAdminDb() {
    const app = getAdminApp();
    if (!app) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT not set. Check your environment variables.");
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["firestore"](app);
}
function getAdminAuth() {
    const app = getAdminApp();
    if (!app) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT not set. Check your environment variables.");
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["auth"](app);
}
;
}),
"[project]/actions/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"006f48a6a43b761d0fd8652a84671ca544a4a5ff4d":{"name":"destroySession"},"40900c75174f8f2e95daa20e1a6a809a4b238212f8":{"name":"createSession"}},"actions/session.ts",""] */ __turbopack_context__.s([
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/firebase-admin.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
async function createSession(idToken) {
    try {
        const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdminAuth"])();
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdminDb"])();
        // 1. Verify the Firebase ID token server-side
        const decoded = await auth.verifyIdToken(idToken);
        const uid = decoded.uid;
        // 2. Fetch role from Firestore (default to "user" if doc doesn't exist yet)
        const userDoc = await db.collection("users").doc(uid).get();
        const role = userDoc.exists ? userDoc.data()?.role ?? "user" : "user";
        // 3. Set secure HTTP-only cookies
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
        const cookieOptions = {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: SESSION_MAX_AGE,
            path: "/"
        };
        cookieStore.set("session", uid, cookieOptions);
        cookieStore.set("role", role, cookieOptions);
        return {
            success: true,
            role
        };
    } catch (error) {
        console.error("createSession error:", error);
        return {
            success: false,
            error: error.message ?? "Session creation failed"
        };
    }
}
async function destroySession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete("session");
    cookieStore.delete("role");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createSession,
    destroySession
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createSession, "40900c75174f8f2e95daa20e1a6a809a4b238212f8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(destroySession, "006f48a6a43b761d0fd8652a84671ca544a4a5ff4d", null);
}),
"[project]/.next-internal/server/app/admin/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/actions/session.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$actions$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/actions/session.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/admin/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/actions/session.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40900c75174f8f2e95daa20e1a6a809a4b238212f8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$actions$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSession"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$login$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$actions$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/login/page/actions.js { ACTIONS_MODULE0 => "[project]/actions/session.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$actions$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/actions/session.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_0k9ip8l._.js.map