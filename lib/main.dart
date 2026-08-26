import 'package:flutter/material.dart';

void main() {
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
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Soma Fácil Web'),
        ),
      ),
    );
  }
}
