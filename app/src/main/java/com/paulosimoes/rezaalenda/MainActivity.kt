package com.paulosimoes.rezaalenda

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Message
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.paulosimoes.rezaalenda.R
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    inner class WebAppInterface(private val context: Context) {
        @JavascriptInterface
        fun getBase64FromBlob(base64: String, mimeType: String) {
            val fileName = "relatorio-${System.currentTimeMillis()}.pdf"
            saveFile(base64, fileName, mimeType)
        }

        @JavascriptInterface
        fun openWhatsApp(phone: String, message: String) {
            val url = "https://api.whatsapp.com/send?phone=$phone&text=${URLEncoder.encode(message, "UTF-8")}"
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            intent.setPackage("com.whatsapp")
            try {
                startActivity(intent)
            } catch (e: ActivityNotFoundException) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "WhatsApp não está instalado.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        webView = findViewById(R.id.webview)
        configureWebView()

        webView.loadUrl("https://rezaalenda.netlify.app/")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.javaScriptCanOpenWindowsAutomatically = true
        webView.settings.setSupportMultipleWindows(true)
        webView.settings.userAgentString = "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.105 Mobile Safari/537.36"

        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")

        webView.webViewClient = WebViewClient()

        webView.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(view: WebView?, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message?): Boolean {
                val newWebView = WebView(this@MainActivity)
                newWebView.settings.javaScriptEnabled = true
                newWebView.settings.userAgentString = "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.105 Mobile Safari/537.36"
                val dialog = Dialog(this@MainActivity)
                dialog.setContentView(newWebView)
                dialog.show()
                newWebView.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String) {
                        if (url.contains("rezaalenda.netlify.app/__/auth/handler")) {
                            dialog.dismiss()
                        }
                    }
                }
                newWebView.webChromeClient = object : WebChromeClient() {
                    override fun onCloseWindow(window: WebView?) {
                        dialog.dismiss()
                    }
                }
                val transport = resultMsg?.obj as WebView.WebViewTransport
                transport.webView = newWebView
                resultMsg.sendToTarget()
                return true
            }
        }

        webView.setDownloadListener { url, _, _, mimeType, _ ->
            if (url.startsWith("blob:")) {
                val js = "javascript:fetch('$url')" +
                        ".then(res => res.blob())" +
                        ".then(blob => {" +
                        "    const reader = new FileReader();" +
                        "    reader.onload = (e) => {" +
                        "        AndroidBridge.getBase64FromBlob(e.target.result, blob.type);" +
                        "    };" +
                        "    reader.readAsDataURL(blob);" +
                        "});"
                webView.evaluateJavascript(js, null)
                Toast.makeText(applicationContext, "A preparar o relatório...", Toast.LENGTH_SHORT).show()
            } else {
                try {
                    val intent = Intent(Intent.ACTION_VIEW)
                    intent.data = Uri.parse(url)
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(applicationContext, "Não foi possível abrir o link.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun saveFile(base64data: String, fileName: String, mimeType: String) {
        try {
            val pureBase64 = base64data.substring(base64data.indexOf(",") + 1)
            val fileData = Base64.decode(pureBase64, Base64.DEFAULT)

            val resolver = contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }

            val uri = resolver.insert(MediaStore.Files.getContentUri("external"), contentValues)

            if (uri != null) {
                resolver.openOutputStream(uri).use { outputStream ->
                    outputStream?.write(fileData)
                }
                runOnUiThread {
                    Toast.makeText(this, "Relatório guardado na pasta Downloads!", Toast.LENGTH_LONG).show()
                }
            } else {
                throw Exception("Não foi possível criar o registo no MediaStore.")
            }
        } catch (e: Exception) {
            runOnUiThread {
                Toast.makeText(this, "Erro ao guardar o ficheiro: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
