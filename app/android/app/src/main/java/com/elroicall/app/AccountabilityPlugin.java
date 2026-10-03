package com.elroicall.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Process;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "Accountability")
public class AccountabilityPlugin extends Plugin {
    private boolean hasUsageAccess() {
        AppOpsManager appOps =
            (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            getContext().getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("supported", true);
        result.put("granted", hasUsageAccess());
        result.put(
            "detail",
            hasUsageAccess()
                ? "Android usage access is enabled. Activity checks stay on this device."
                : "Android requires you to grant Usage Access in Settings."
        );
        call.resolve(result);
    }

    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
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

        JSObject minutes = new JSObject();
        for (String packageName : packages) minutes.put(packageName, 0);

        if (stats != null) {
            for (UsageStats stat : stats) {
                if (!packages.contains(stat.getPackageName())) continue;
                long value = Math.max(0, stat.getTotalTimeInForeground() / 60000L);
                minutes.put(stat.getPackageName(), value);
            }
        }

        JSObject result = new JSObject();
        result.put("minutes", minutes);
        call.resolve(result);
    }
}
