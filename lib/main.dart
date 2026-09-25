import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Tela cheia no Android
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const SomaFacilApp());
}

class SomaFacilApp extends StatelessWidget {
  const SomaFacilApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Soma Fácil',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF4D57),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const SomaFacilWebView(),
    );
  }
}

class SomaFacilWebView extends StatefulWidget {
  const SomaFacilWebView({super.key});

  @override
  State<SomaFacilWebView> createState() => _SomaFacilWebViewState();
}

class _SomaFacilWebViewState extends State<SomaFacilWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  static const String _appUrl = 'https://calculadora-pro-ten.vercel.app';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E1118))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _isLoading = true),
          onPageFinished: (_) => setState(() => _isLoading = false),
          onWebResourceError: (error) {
            debugPrint('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(_appUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0E1118),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFFF4D57),
                  strokeWidth: 3,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
