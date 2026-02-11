import SwiftUI

struct OutputView: View {
    let result: ShellResult
    @State private var isExpanded = false

    var body: some View {
        DisclosureGroup("Output", isExpanded: $isExpanded) {
            VStack(alignment: .leading, spacing: Theme.tightSpacing) {
                if !result.stdout.isEmpty {
                    Text("stdout")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                    ScrollView(.horizontal, showsIndicators: false) {
                        Text(result.stdout)
                            .font(Theme.codeFont)
                            .textSelection(.enabled)
                    }
                }
                if !result.stderr.isEmpty {
                    Text("stderr")
                        .font(.callout)
                        .foregroundStyle(Theme.stderrLabel)
                    ScrollView(.horizontal, showsIndicators: false) {
                        Text(result.stderr)
                            .font(Theme.codeFont)
                            .foregroundStyle(Theme.stderrText)
                            .textSelection(.enabled)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 4)
        }
        .font(.callout)
        .foregroundStyle(.secondary)
    }
}
