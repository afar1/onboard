import SwiftUI

struct BashCellView: View {
    @Bindable var viewModel: CellViewModel
    @State private var copied = false
    @State private var isExpanded = true

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.innerSpacing) {
            // Header row: chevron + title + status badge
            HStack(spacing: Theme.tightSpacing) {
                Image(systemName: "chevron.right")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                    .rotationEffect(.degrees(isExpanded ? 90 : 0))

                VStack(alignment: .leading, spacing: 2) {
                    Text(viewModel.definition.title)
                        .font(.title3.bold())
                    if let desc = viewModel.definition.description {
                        Text(desc)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                if !isExpanded {
                    statusIcon
                }
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                // Command row: code + copy + run/status
                HStack(spacing: Theme.tightSpacing) {
                    Text(viewModel.definition.command)
                        .font(Theme.codeFont)
                        .lineLimit(nil)
                        .padding(Theme.innerSpacing)
                        .padding(.trailing, 28)
                        .frame(maxWidth: .infinity, minHeight: 40, alignment: .leading)
                        .background(Theme.codeBackground)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.codeCornerRadius))
                        .overlay(alignment: .trailing) {
                            Button {
                                NSPasteboard.general.clearContents()
                                NSPasteboard.general.setString(viewModel.definition.command, forType: .string)
                                copied = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                    copied = false
                                }
                            } label: {
                                Image(systemName: copied ? "checkmark" : "square.on.square")
                                    .font(.callout)
                                    .foregroundStyle(.secondary)
                                    .padding(8)
                                    .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                        }

                    statusOrButton
                }

                // Output section
                switch viewModel.state {
                case .completed(let result):
                    OutputView(result: result)
                case .failed(let message):
                    Text(message)
                        .font(.callout)
                        .foregroundStyle(Theme.errorForeground)
                default:
                    EmptyView()
                }
            }
        }
        .padding()
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius))
    }

    @ViewBuilder
    private var statusIcon: some View {
        switch viewModel.state {
        case .idle:
            EmptyView()
        case .running:
            ProgressView()
                .controlSize(.small)
        case .completed(let result):
            Image(systemName: result.succeeded ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(result.succeeded ? Theme.successColor : Theme.errorForeground)
                .font(.body)
        case .failed:
            Image(systemName: "xmark.circle.fill")
                .foregroundStyle(Theme.errorForeground)
                .font(.body)
        }
    }

    @ViewBuilder
    private var statusOrButton: some View {
        switch viewModel.state {
        case .idle:
            Button {
                Task { await viewModel.run() }
            } label: {
                Text("Run")
            }
            .buttonStyle(.borderedProminent)
            .clipShape(RoundedRectangle(cornerRadius: Theme.codeCornerRadius))
        case .running:
            ProgressView()
                .controlSize(.small)
        case .completed(let result):
            Image(systemName: result.succeeded ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(result.succeeded ? Theme.successColor : Theme.errorForeground)
                .font(.title2)
        case .failed:
            Image(systemName: "xmark.circle.fill")
                .foregroundStyle(Theme.errorForeground)
                .font(.title2)
        }
    }
}
