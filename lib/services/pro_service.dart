import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// URL base do backend na Vercel
const String _backendUrl = 'https://calculadora-pro.vercel.app';

/// Chave de persistência local
const String _prefKeyIsPro = 'is_pro';
const String _prefKeyTrialStart = 'trial_start';
const String _prefKeyDeviceId = 'device_id';

/// Duração do período gratuito
const Duration _trialDuration = Duration(days: 30);

class ProService {
  ProService._();
  static final ProService instance = ProService._();

  /// Retorna ou cria um device_id único e persistente
  Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString(_prefKeyDeviceId);
    if (id == null) {
      id = '${Platform.operatingSystem}_${DateTime.now().microsecondsSinceEpoch}';
      await prefs.setString(_prefKeyDeviceId, id);
    }
    return id;
  }

  /// Inicia o trial se ainda não iniciou
  Future<void> ensureTrialStarted() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getString(_prefKeyTrialStart) == null) {
      await prefs.setString(
        _prefKeyTrialStart,
        DateTime.now().toIso8601String(),
      );
    }
  }

  /// Verifica se o trial ainda está ativo
  Future<bool> isTrialActive() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefKeyTrialStart);
    if (raw == null) return true; // ainda não iniciou, considera ativo
    final start = DateTime.tryParse(raw);
    if (start == null) return false;
    return DateTime.now().difference(start) < _trialDuration;
  }

  /// Dias restantes do trial (0 se expirado)
  Future<int> trialDaysRemaining() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefKeyTrialStart);
    if (raw == null) return 30;
    final start = DateTime.tryParse(raw);
    if (start == null) return 0;
    final elapsed = DateTime.now().difference(start);
    final remaining = _trialDuration - elapsed;
    return remaining.isNegative ? 0 : remaining.inDays;
  }

  /// Verifica se é PRO (local primeiro, depois remoto)
  Future<bool> isPro() async {
    final prefs = await SharedPreferences.getInstance();

    // Cache local
    if (prefs.getBool(_prefKeyIsPro) == true) return true;

    // Consulta remota
    try {
      final deviceId = await getDeviceId();
      final uri = Uri.parse('$_backendUrl/api/check-pro?device_id=$deviceId');
      final client = HttpClient();
      final request = await client.getUrl(uri);
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      client.close();

      final json = jsonDecode(body) as Map<String, dynamic>;
      final isPro = json['is_pro'] == true;

      if (isPro) {
        await prefs.setBool(_prefKeyIsPro, true);
      }

      return isPro;
    } catch (e) {
      debugPrint('ProService.isPro error: $e');
      return false;
    }
  }

  /// Cria preferência de pagamento e retorna a URL do checkout
  Future<String?> createCheckoutUrl() async {
    try {
      final deviceId = await getDeviceId();
      final uri = Uri.parse('$_backendUrl/api/create-payment');
      final client = HttpClient();
      final request = await client.postUrl(uri);
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({'device_id': deviceId}));
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      client.close();

      final json = jsonDecode(body) as Map<String, dynamic>;
      return json['checkout_url'] as String?;
    } catch (e) {
      debugPrint('ProService.createCheckoutUrl error: $e');
      return null;
    }
  }

  /// Chamado quando o deep link de sucesso chega
  Future<void> activateProLocally() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKeyIsPro, true);
  }
}
