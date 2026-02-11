import SwiftUI

enum Theme {
    // Typography
    static let codeFont: Font = .system(size: 13, weight: .regular, design: .monospaced)

    // Spacing
    static let pagePadding: CGFloat = 24
    static let cardSpacing: CGFloat = 16
    static let innerSpacing: CGFloat = 10
    static let tightSpacing: CGFloat = 8

    // Corners
    static let cardCornerRadius: CGFloat = 12
    static let codeCornerRadius: CGFloat = 6

    // Backgrounds
    static let cardBackground: some ShapeStyle = .fill.quinary
    static let codeBackground: some ShapeStyle = .fill.quaternary
    static let errorBackground: some ShapeStyle = Color.red.opacity(0.1)

    // Status colors
    static let errorForeground = Color.red
    static let stderrLabel = Color.red.opacity(0.8)
    static let stderrText = Color.red.opacity(0.9)
    static let successColor = Color.green
}
