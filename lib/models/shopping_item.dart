class ShoppingItem {
  const ShoppingItem({
    required this.id,
    required this.value,
    required this.createdAt,
    this.description,
  });

  factory ShoppingItem.create({
    required double value,
    String? description,
  }) {
    return ShoppingItem(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      value: value,
      createdAt: DateTime.now(),
      description: _normalizeDescription(description),
    );
  }

  factory ShoppingItem.fromJson(Map<String, dynamic> json) {
    return ShoppingItem(
      id: json['id'] as String,
      value: (json['value'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      description: _normalizeDescription(json['description'] as String?),
    );
  }

  final String id;
  final double value;
  final DateTime createdAt;
  final String? description;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'value': value,
      'createdAt': createdAt.toIso8601String(),
      'description': description,
    };
  }
}

String? _normalizeDescription(String? raw) {
  final trimmed = raw?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return null;
  }
  return trimmed;
}
