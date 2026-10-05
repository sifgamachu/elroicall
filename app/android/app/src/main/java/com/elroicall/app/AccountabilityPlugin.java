package com.elroicall.app;

import android.Manifest;
import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CapacitorPlugin(
    name = "Accountability",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class AccountabilityPlugin extends Plugin {
    private boolean hasUsageAccess() {
        return AccountabilityWorker.hasUsageAccess(getContext());
    }

    private boolean notificationsGranted() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            getPermissionState("notifications") == PermissionState.GRANTED;
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(
            AccountabilityWorker.PREFS,
            Context.MODE_PRIVATE
        );
    }

    private void resolveStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("supported", true);
        result.put("granted", hasUsageAccess());
        result.put("notificationsGranted", notificationsGranted());
        result.put("monitoringEnabled", prefs().getBoolean("enabled", false));
        result.put(
            "detail",
            hasUsageAccess()
                ? "Android usage access is enabled. Activity checks stay on this device."
                : "Android requires you to grant Usage Access in Settings."
        );
        call.resolve(result);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        resolveStatus(call);
    }

    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void requestNotifications(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || notificationsGranted()) {
            AccountabilityWorker.syncSchedule(getContext());
            resolveStatus(call);
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        AccountabilityWorker.syncSchedule(getContext());
        resolveStatus(call);
    }

    @PluginMethod
    public void configure(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        String intention = call.getString("intention", "");
        JSArray goals = call.getArray("goals");
        if (goals == null) {
            call.reject("goals is required.");
            return;
        }
        prefs().edit()
            .putBoolean("enabled", enabled)
            .putString("intention", intention == null ? "" : intention)
            .putString("goals", goals.toString())
            .apply();
        AccountabilityWorker.syncSchedule(getContext());
        resolveStatus(call);
    }

    @PluginMethod
    public void snoozeToday(PluginCall call) {
        prefs().edit()
            .putString("snoozed_date", AccountabilityWorker.todayKey())
            .apply();
        call.resolve();
    }

    @PluginMethod
    public void getUsage(PluginCall call) {
        if (!hasUsageAccess()) {
            call.reject("Usage Access has not been granted.");
            return;
        }

        JSArray requested = call.getArray("packages");
        if (requested == null) {
            call.reject("packages is required.");
            return;
        }

        Set<String> packages = new HashSet<>();
        try {
            List<Object> values = requested.toList();
            for (Object value : values) {
                if (value instanceof String) packages.add((String) value);
            }
        } catch (Exception exception) {
            call.reject("Invalid package list.");
            return;
        }

        long now = System.currentTimeMillis();
        java.util.Calendar startCalendar = java.util.Calendar.getInstance();
        startCalendar.set(java.util.Calendar.HOUR_OF_DAY, 0);
        startCalendar.set(java.util.Calendar.MINUTE, 0);
        startCalendar.set(java.util.Calendar.SECOND, 0);
        startCalendar.set(java.util.Calendar.MILLISECOND, 0);
        long start = startCalendar.getTimeInMillis();

        UsageStatsManager manager =
            (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        List<UsageStats> stats =
            manager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, now);

        Map<String, Long> totals = new HashMap<>();
        for (String packageName : packages) totals.put(packageName, 0L);
        if (stats != null) {
            for (UsageStats stat : stats) {
                String packageName = stat.getPackageName();
                if (!packages.contains(packageName)) continue;
                long current = totals.containsKey(packageName)
                    ? totals.get(packageName)
                    : 0L;
                totals.put(
                    packageName,
                    current + Math.max(0, stat.getTotalTimeInForeground() / 60000L)
                );
            }
        }

        JSObject minutes = new JSObject();
        for (Map.Entry<String, Long> entry : totals.entrySet()) {
            minutes.put(entry.getKey(), entry.getValue());
        }

        JSObject result = new JSObject();
        result.put("minutes", minutes);
        call.resolve(result);
    }
}
