package com.mobileaction.omnivoise

import android.app.SearchManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.provider.AlarmClock
import android.provider.CalendarContract
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import org.json.JSONObject

object AppIntentHandler {

    private const val TAG = "AppIntentHandler"

    fun execute(context: Context, toolName: String, argumentsJson: String) {
        try {
            val args = JSONObject(argumentsJson)
            when (toolName) {
                "media_control" -> handleMediaControl(
                    context,
                    args.optString("app"),
                    args.optString("action"),
                    args.optString("query_type"),
                    args.optString("search_query")
                )
                "send_messaging_app" -> handleMessagingApp(
                    context,
                    args.optString("app"),
                    args.optString("recipient", null),
                    args.optString("message_body"),
                    args.optString("attachment_type")
                )
                "compose_email" -> handleComposeEmail(
                    context,
                    args.optString("to"),
                    args.optString("subject"),
                    args.optString("body")
                )
                "commerce_action" -> handleCommerceAction(
                    context,
                    args.optString("app"),
                    args.optString("action"),
                    args.optString("item_query"),
                    args.optString("store_section")
                )
                "social_action" -> handleSocialAction(
                    context,
                    args.optString("app"),
                    args.optString("action"),
                    args.optString("target_user"),
                    args.optString("content_type")
                )
                "web_browser_action" -> handleWebBrowserAction(
                    context,
                    args.optString("browser"),
                    args.optString("action"),
                    args.optString("url", null),
                    args.optString("search_query", null)
                )
                "hardware_control" -> handleHardwareControl(
                    context,
                    args.optString("setting"),
                    args.optString("action"),
                    if (args.has("value") && !args.isNull("value")) args.optInt("value") else null
                )
                "set_alarm" -> handleSetAlarm(
                    context,
                    args.optString("time_string"),
                    args.optString("label"),
                    args.optBoolean("recurring")
                )
                "create_reminder" -> handleCreateReminder(
                    context,
                    args.optString("title"),
                    args.optString("datetime_iso"),
                    args.optString("priority")
                )
                "schedule_calendar_event" -> handleScheduleCalendarEvent(
                    context,
                    args.optString("title"),
                    args.optString("start_time"),
                    args.optString("end_time"),
                    args.optString("location"),
                    args.optJSONArray("attendees")
                )
                "capture_screen_context" -> handleCaptureScreenContext(
                    context,
                    args.optString("action_type")
                )
                else -> Log.w(TAG, "Unknown tool: $toolName")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse or execute JSON intent: ${e.message}", e)
        }
    }

    private fun isAppInstalled(context: Context, packageName: String): Boolean {
        return try {
            context.packageManager.getPackageInfo(packageName, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun fallbackToPlayStore(context: Context, packageName: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$packageName"))
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        }
    }

    private fun handleMediaControl(context: Context, app: String, action: String, queryType: String, searchQuery: String) {
        val packageName = when (app) {
            "youtube_music" -> "com.google.android.apps.youtube.music"
            "youtube" -> "com.google.android.youtube"
            "spotify" -> "com.spotify.music"
            else -> "com.google.android.apps.youtube.music"
        }

        if (!isAppInstalled(context, packageName)) {
            fallbackToPlayStore(context, packageName)
            return
        }

        try {
            if (action == "play" || action == "search") {
                val intent = Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
                intent.putExtra(MediaStore.EXTRA_MEDIA_FOCUS, queryType)
                intent.putExtra(SearchManager.QUERY, searchQuery)
                intent.setPackage(packageName)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            } else {
                val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
                launchIntent?.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                launchIntent?.let { context.startActivity(it) }
            }
        } catch (e: ActivityNotFoundException) {
            fallbackToPlayStore(context, packageName)
        }
    }

    private fun handleMessagingApp(context: Context, app: String, recipient: String?, messageBody: String, attachmentType: String) {
        val packageName = if (app == "telegram") "org.telegram.messenger" else "com.whatsapp"

        if (!isAppInstalled(context, packageName)) {
            fallbackToPlayStore(context, packageName)
            return
        }

        try {
            val intent = Intent(Intent.ACTION_VIEW)
            if (app == "whatsapp") {
                val url = if (recipient.isNullOrEmpty()) {
                    "whatsapp://send?text=${Uri.encode(messageBody)}"
                } else {
                    "https://api.whatsapp.com/send?phone=$recipient&text=${Uri.encode(messageBody)}"
                }
                intent.data = Uri.parse(url)
            } else {
                val url = if (recipient.isNullOrEmpty()) {
                    "tg://msg?text=${Uri.encode(messageBody)}"
                } else {
                    "https://t.me/$recipient?text=${Uri.encode(messageBody)}"
                }
                intent.data = Uri.parse(url)
                intent.setPackage("org.telegram.messenger")
            }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            fallbackToPlayStore(context, packageName)
        }
    }

    private fun handleComposeEmail(context: Context, to: String, subject: String, body: String) {
        val packageName = "com.google.android.gm"
        try {
            val intent = Intent(Intent.ACTION_SENDTO)
            intent.data = Uri.parse("mailto:")
            intent.putExtra(Intent.EXTRA_EMAIL, arrayOf(to))
            intent.putExtra(Intent.EXTRA_SUBJECT, subject)
            intent.putExtra(Intent.EXTRA_TEXT, body)
            intent.setPackage(packageName)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val fallbackIntent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$to?subject=${Uri.encode(subject)}&body=${Uri.encode(body)}"))
            fallbackIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            try {
                context.startActivity(fallbackIntent)
            } catch (e2: ActivityNotFoundException) {
                fallbackToPlayStore(context, packageName)
            }
        }
    }

    private fun handleCommerceAction(context: Context, app: String, action: String, itemQuery: String, storeSection: String) {
        val isAmazon = app == "amazon"
        val packageName = if (isAmazon) "com.amazon.mShop.android.shopping" else "in.swiggy.android"

        if (!isAppInstalled(context, packageName)) {
            fallbackToPlayStore(context, packageName)
            return
        }

        try {
            val intent = Intent(Intent.ACTION_VIEW)
            if (isAmazon) {
                intent.data = Uri.parse("https://www.amazon.in/s?k=${Uri.encode(itemQuery)}")
            } else {
                if (storeSection == "instamart" || app == "instamart") {
                    intent.data = Uri.parse("swiggy://instamart?query=${Uri.encode(itemQuery)}")
                } else {
                    intent.data = Uri.parse("swiggy://explore?query=${Uri.encode(itemQuery)}")
                }
            }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            intent.setPackage(packageName)
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            fallbackToPlayStore(context, packageName)
        }
    }

    private fun handleSocialAction(context: Context, app: String, action: String, targetUser: String, contentType: String) {
        val packageName = "com.instagram.android"
        if (!isAppInstalled(context, packageName)) {
            fallbackToPlayStore(context, packageName)
            return
        }

        try {
            val intent = Intent(Intent.ACTION_VIEW)
            when (action) {
                "open_profile" -> intent.data = Uri.parse("instagram://user?username=${Uri.encode(targetUser)}")
                "open_reels" -> intent.data = Uri.parse("instagram://reels")
                "search_hashtag" -> intent.data = Uri.parse("instagram://explore?tag=${Uri.encode(targetUser)}")
                else -> intent.data = Uri.parse("https://www.instagram.com/${Uri.encode(targetUser)}")
            }
            intent.setPackage(packageName)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            fallbackToPlayStore(context, packageName)
        }
    }

    private fun handleWebBrowserAction(context: Context, browser: String, action: String, url: String?, searchQuery: String?) {
        val packageName = when (browser) {
            "chrome" -> "com.android.chrome"
            "opera" -> "com.opera.browser"
            else -> null
        }

        if (packageName != null && !isAppInstalled(context, packageName)) {
            fallbackToPlayStore(context, packageName)
            return
        }

        try {
            val targetUrl = if (action == "web_search" || action == "incognito_search") {
                "https://www.google.com/search?q=${Uri.encode(searchQuery ?: "")}"
            } else {
                url ?: "https://www.google.com"
            }

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl))
            packageName?.let { intent.setPackage(it) }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            if (action == "incognito_search" && browser == "chrome") {
                intent.putExtra("com.google.android.apps.chrome.EXTRA_OPEN_NEW_INCOGNITO_TAB", true)
            }

            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            if (packageName != null) fallbackToPlayStore(context, packageName)
        }
    }

    private fun handleHardwareControl(context: Context, setting: String, action: String, value: Int?) {
        try {
            when (setting) {
                "flashlight" -> {
                    val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                    val cameraId = cameraManager.cameraIdList.firstOrNull()
                    if (cameraId != null) {
                        val turnOn = action == "turn_on" || action == "toggle"
                        cameraManager.setTorchMode(cameraId, turnOn)
                    }
                }
                "volume" -> {
                    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                    if (value != null && action == "set_level") {
                        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                        val targetVolume = (maxVolume * (value / 100.0)).toInt().coerceIn(0, maxVolume)
                        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, AudioManager.FLAG_SHOW_UI)
                    }
                }
                "wifi" -> {
                    val intent = Intent(Settings.ACTION_WIFI_SETTINGS)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                }
                "bluetooth" -> {
                    val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                }
                "brightness", "do_not_disturb", "hotspot", "battery_saver" -> {
                    val settingsAction = when (setting) {
                        "brightness" -> Settings.ACTION_DISPLAY_SETTINGS
                        "do_not_disturb" -> Settings.ACTION_ZEN_MODE_PRIORITY_SETTINGS
                        "battery_saver" -> Settings.ACTION_BATTERY_SAVER_SETTINGS
                        else -> Settings.ACTION_SETTINGS
                    }
                    val intent = Intent(settingsAction)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                }
                else -> Log.w(TAG, "Unhandled hardware setting: $setting")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to control hardware: ${e.message}", e)
        }
    }

    private fun handleSetAlarm(context: Context, timeString: String, label: String, recurring: Boolean) {
        try {
            var hour = 0
            var minute = 0
            val upperTime = timeString.uppercase()
            val amPmRegex = "(\\d{1,2}):?(\\d{2})?\\s*(AM|PM)?".toRegex()
            val match = amPmRegex.find(upperTime)
            if (match != null) {
                val h = match.groups[1]?.value?.toIntOrNull() ?: 0
                val m = match.groups[2]?.value?.toIntOrNull() ?: 0
                val amPm = match.groups[3]?.value
                
                hour = h
                minute = m
                if (amPm == "PM" && hour < 12) hour += 12
                if (amPm == "AM" && hour == 12) hour = 0
            }
            
            val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_MESSAGE, label)
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, minute)
                putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                if (recurring) {
                    val days = java.util.ArrayList<Int>()
                    days.add(java.util.Calendar.MONDAY)
                    days.add(java.util.Calendar.TUESDAY)
                    days.add(java.util.Calendar.WEDNESDAY)
                    days.add(java.util.Calendar.THURSDAY)
                    days.add(java.util.Calendar.FRIDAY)
                    val bundle = android.os.Bundle()
                    bundle.putIntegerArrayList(AlarmClock.EXTRA_DAYS, days)
                    putExtras(bundle)
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set alarm", e)
        }
    }

    private fun handleCreateReminder(context: Context, title: String, datetimeIso: String, priority: String) {
        try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
            val timeMillis = try { sdf.parse(datetimeIso)?.time } catch (e: Exception) { null } ?: System.currentTimeMillis()
            
            val intent = Intent(Intent.ACTION_INSERT).apply {
                data = CalendarContract.Events.CONTENT_URI
                putExtra(CalendarContract.Events.TITLE, "Reminder: $title")
                putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, timeMillis)
                putExtra(CalendarContract.EXTRA_EVENT_END_TIME, timeMillis + 30 * 60 * 1000)
                putExtra(CalendarContract.Events.HAS_ALARM, 1)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create reminder", e)
        }
    }

    private fun handleScheduleCalendarEvent(
        context: Context, 
        title: String, 
        startTime: String, 
        endTime: String, 
        location: String, 
        attendees: org.json.JSONArray?
    ) {
        try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
            val startMillis = try { sdf.parse(startTime)?.time } catch (e: Exception) { null } ?: System.currentTimeMillis()
            val endMillis = try { sdf.parse(endTime)?.time } catch (e: Exception) { null } ?: (startMillis + 3600000)

            val intent = Intent(Intent.ACTION_INSERT).apply {
                data = CalendarContract.Events.CONTENT_URI
                putExtra(CalendarContract.Events.TITLE, title)
                putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, startMillis)
                putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endMillis)
                putExtra(CalendarContract.Events.EVENT_LOCATION, location)
                
                if (attendees != null && attendees.length() > 0) {
                    val emailList = mutableListOf<String>()
                    for (i in 0 until attendees.length()) {
                        emailList.add(attendees.getString(i))
                    }
                    putExtra(Intent.EXTRA_EMAIL, emailList.toTypedArray())
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule calendar event", e)
        }
    }

    private fun handleCaptureScreenContext(context: Context, actionType: String) {
        try {
            // Simulated Screen Capture / OCR Trigger
            // In a production app, this would trigger an AccessibilityService or MediaProjection capture.
            Log.d(TAG, "Screen context capture requested with action: $actionType")
            android.widget.Toast.makeText(context, "Capturing screen for: $actionType", android.widget.Toast.LENGTH_LONG).show()
            
            // Broadcast an intent that the VoiceAssistantService (or another receiver) can pick up
            val intent = Intent("com.mobileaction.omnivoise.CAPTURE_SCREEN").apply {
                putExtra("action_type", actionType)
                setPackage(context.packageName)
            }
            context.sendBroadcast(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to trigger screen capture", e)
        }
    }
}
