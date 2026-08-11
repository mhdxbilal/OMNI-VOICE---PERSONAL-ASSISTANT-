package com.mobileaction.omnivoise

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Start foreground service if RECORD_AUDIO is granted
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            val serviceIntent = Intent(this, VoiceAssistantService::class.java)
            ContextCompat.startForegroundService(this, serviceIntent)
        }

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme()
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

@Composable
fun MainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Mic, contentDescription = "Assistant") },
                    label = { Text("Assistant") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Permissions") },
                    label = { Text("Permissions") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            if (selectedTab == 0) {
                AssistantChatScreen()
            } else {
                PermissionDashboardScreen()
            }
        }
    }
}

@Composable
fun AssistantChatScreen() {
    val context = LocalContext.current
    var messages by remember { mutableStateOf(listOf("Hi, I'm AURA. How can I help?")) }
    var inputText by remember { mutableStateOf("") }
    
    val recordAudioPermission = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
    
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            val serviceIntent = Intent(context, VoiceAssistantService::class.java)
            ContextCompat.startForegroundService(context, serviceIntent)
            messages = messages + "Microphone enabled. Listening..."
        } else {
            messages = messages + "Microphone permission denied. Cannot use voice."
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(16.dp),
            reverseLayout = true
        ) {
            items(messages.reversed()) { msg ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    contentAlignment = if (msg.startsWith("You:")) Alignment.CenterEnd else Alignment.CenterStart
                ) {
                    Text(
                        text = msg,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (msg.startsWith("You:")) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp),
                        color = if (msg.startsWith("You:")) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        
        if (!recordAudioPermission) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.onErrorContainer)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Voice commands require Microphone access.",
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.weight(1f)
                    )
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.RECORD_AUDIO) }) {
                        Text("Grant")
                    }
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a command...") },
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            FloatingActionButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        messages = messages + "You: $inputText"
                        messages = messages + "I'm a native assistant. I'll handle that shortly!"
                        inputText = ""
                    } else {
                        if (recordAudioPermission) {
                            messages = messages + "Listening..."
                        } else {
                            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }
                    }
                },
                shape = CircleShape,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Speak")
            }
        }
    }
}

data class PermissionItem(val permission: String, val name: String, val rationale: String)

@Composable
fun PermissionDashboardScreen() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val permissionsList = listOf(
        PermissionItem(Manifest.permission.RECORD_AUDIO, "Microphone", "Needed to hear voice commands."),
        PermissionItem(Manifest.permission.ACCESS_FINE_LOCATION, "Location", "Needed for weather and local suggestions."),
        PermissionItem(Manifest.permission.READ_CONTACTS, "Contacts", "Needed to call or message people."),
        PermissionItem(Manifest.permission.CAMERA, "Camera", "Needed for visual assistant features."),
        PermissionItem(Manifest.permission.CALL_PHONE, "Phone", "Needed to initiate calls directly."),
        PermissionItem(Manifest.permission.READ_CALL_LOG, "Call Logs", "Needed to read recent calls."),
        PermissionItem(Manifest.permission.SEND_SMS, "SMS", "Needed to send text messages."),
        PermissionItem(Manifest.permission.GET_ACCOUNTS, "Mail / Accounts", "Needed to access emails and calendar."),
        PermissionItem(Manifest.permission.POST_NOTIFICATIONS, "Notifications", "Needed for background listening alerts.")
    )

    // A state map to hold current permission statuses
    var permissionStates by remember { mutableStateOf(mapOf<String, Boolean>()) }

    // Update statuses function
    val updateStatuses = {
        val newStates = mutableMapOf<String, Boolean>()
        for (item in permissionsList) {
            val isGranted = ContextCompat.checkSelfPermission(context, item.permission) == PackageManager.PERMISSION_GRANTED
            newStates[item.permission] = isGranted
        }
        permissionStates = newStates
    }

    // Refresh on Resume
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                updateStatuses()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    var selectedPermissionToRequest by remember { mutableStateOf<String?>(null) }
    
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        updateStatuses()
        if (!isGranted && selectedPermissionToRequest != null) {
            // If denied, we should guide them to settings if they try again
        }
        selectedPermissionToRequest = null
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            "Privacy & Permissions Dashboard",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )
        
        // Battery Optimization
        BatteryOptimizationCard()

        LazyColumn(modifier = Modifier.weight(1f)) {
            items(permissionsList) { item ->
                val isGranted = permissionStates[item.permission] ?: false
                
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .clickable {
                            if (!isGranted) {
                                selectedPermissionToRequest = item.permission
                                launcher.launch(item.permission)
                            }
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = item.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(text = item.rationale, fontSize = 12.sp, color = Color.Gray)
                        }
                        
                        if (isGranted) {
                            Text("Allowed", color = Color.Green, fontWeight = FontWeight.Bold)
                        } else {
                            Button(onClick = { 
                                // Launch standard permission, if system blocks it, launch settings
                                // We will first try to launch standard permission
                                // If they denied previously, we provide a way to open settings
                                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                                val uri = Uri.fromParts("package", context.packageName, null)
                                intent.data = uri
                                // We'll just open settings directly if they click the "Denied" button to enforce the rule
                                context.startActivity(intent)
                            }) {
                                Text("Denied -> Settings")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BatteryOptimizationCard() {
    val context = LocalContext.current
    var ignoring by remember { mutableStateOf(false) }

    val updateState = {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = context.getSystemService(android.os.PowerManager::class.java)
            ignoring = pm?.isIgnoringBatteryOptimizations(context.packageName) == true
        } else {
            ignoring = true
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) updateState()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Battery Optimization", fontWeight = FontWeight.Bold)
                Text(
                    "Disable to allow continuous background listening.",
                    fontSize = 12.sp
                )
            }
            if (ignoring) {
                Text("Unrestricted", color = Color.Green, fontWeight = FontWeight.Bold)
            } else {
                Button(onClick = {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                        intent.data = Uri.parse("package:" + context.packageName)
                        context.startActivity(intent)
                    }
                }) {
                    Text("Fix")
                }
            }
        }
    }
}
