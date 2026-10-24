import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clipboard, Play, X, ExternalLink } from 'lucide-react';

const XAML_ICON_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kj8VATj48xgpu6hRIVOSoJomQMTGnR.png';

interface DialogPreset {
  id: string;
  name: string;
  caption: string;
  title: string;
  message: string;
  primaryButton: string;
  secondaryButton?: string;
  closeButton?: string;
  xamlCode: string;
}

const DIALOG_PRESETS: DialogPreset[] = [
  {
    id: 'switch-app',
    name: 'Switch Applications',
    caption: 'Windows Security',
    title: 'Did you mean to switch applications?',
    message: '"Waves Desktop" is trying to open an external application. Do you want to allow this application to switch?',
    primaryButton: 'Yes',
    secondaryButton: 'No',
    xamlCode: `<ContentDialog x:Name="SwitchAppDialog"
    Title="Did you mean to switch applications?"
    Content="&quot;Waves Desktop&quot; is trying to open an external application."
    PrimaryButtonText="Yes"
    CloseButtonText="No"
    DefaultButton="Primary" />`,
  },
  {
    id: 'unsaved-changes',
    name: 'Unsaved Changes',
    caption: 'Waves Editor',
    title: 'Do you want to save changes?',
    message: 'There are unsaved modifications in your current session. If you close now without saving, all progress will be discarded.',
    primaryButton: 'Save',
    secondaryButton: "Don't Save",
    closeButton: 'Cancel',
    xamlCode: `<ContentDialog x:Name="SaveConfirmDialog"
    Title="Do you want to save changes?"
    Content="There are unsaved modifications in your current session."
    PrimaryButtonText="Save"
    SecondaryButtonText="Don't Save"
    CloseButtonText="Cancel"
    DefaultButton="Primary" />`,
  },
  {
    id: 'delete-confirm',
    name: 'Confirm Deletion',
    caption: 'File Management',
    title: 'Delete this item permanently?',
    message: 'This file will be permanently removed from your library. You cannot undo this action.',
    primaryButton: 'Delete',
    secondaryButton: 'Cancel',
    xamlCode: `<ContentDialog x:Name="DeleteDialog"
    Title="Delete this item permanently?"
    Content="This file will be permanently removed from your library."
    PrimaryButtonText="Delete"
    CloseButtonText="Cancel"
    DefaultButton="Close" />`,
  },
];

const controls = [
  { name: 'Button', category: 'Buttons', code: '<Button Content="Save"\n        Click="SaveButton_Click" />' },
  { name: 'RepeatButton', category: 'Buttons', code: '<RepeatButton Content="Add item"\n              Command="{Binding AddItemCommand}"\n              Delay="250"\n              Interval="100" />' },
  { name: 'HyperlinkButton', category: 'Buttons', code: '<HyperlinkButton Content="Open documentation"\n                 NavigateUri="https://learn.microsoft.com/windows/apps/winui/winui3/" />' },
  { name: 'TextBox', category: 'Input', code: '<TextBox Header="Name"\n         PlaceholderText="Enter your name"\n         Text="{Binding UserName, Mode=TwoWay}" />' },
  { name: 'PasswordBox', category: 'Input', code: '<PasswordBox Header="Password"\n             PasswordChanged="PasswordBox_PasswordChanged" />' },
  { name: 'AutoSuggestBox', category: 'Input', code: '<AutoSuggestBox PlaceholderText="Search controls"\n                TextChanged="SearchBox_TextChanged"\n                SuggestionChosen="SearchBox_SuggestionChosen" />' },
  { name: 'NumberBox', category: 'Input', code: '<NumberBox Header="Quantity"\n           Minimum="0"\n           Maximum="100"\n           SpinButtonPlacementMode="Compact" />' },
  { name: 'ComboBox', category: 'Input', code: '<ComboBox Header="Theme"\n          ItemsSource="{Binding Themes}"\n          SelectedItem="{Binding SelectedTheme}" />' },
  { name: 'CheckBox', category: 'Input', code: '<CheckBox Content="Enable notifications"\n          IsChecked="{Binding NotificationsEnabled, Mode=TwoWay}" />' },
  { name: 'RadioButtons', category: 'Input', code: '<RadioButtons Header="Layout"\n              ItemsSource="{Binding LayoutOptions}"\n              SelectedIndex="{Binding SelectedLayoutIndex}" />' },
  { name: 'ToggleSwitch', category: 'Input', code: '<ToggleSwitch Header="Dark mode"\n              OnContent="On"\n              OffContent="Off"\n              IsOn="{Binding IsDarkMode}" />' },
  { name: 'Slider', category: 'Input', code: '<Slider Header="Volume"\n        Minimum="0"\n        Maximum="100"\n        Value="{Binding Volume, Mode=TwoWay}" />' },
  { name: 'ListView', category: 'Collections', code: '<ListView ItemsSource="{Binding Items}"\n         SelectedItem="{Binding SelectedItem, Mode=TwoWay}">\n    <ListView.ItemTemplate>\n        <DataTemplate>\n            <TextBlock Text="{Binding Title}" />\n        </DataTemplate>\n    </ListView.ItemTemplate>\n</ListView>' },
  { name: 'GridView', category: 'Collections', code: '<GridView ItemsSource="{Binding Products}">\n    <GridView.ItemTemplate>\n        <DataTemplate>\n            <Image Source="{Binding ImageUri}" />\n        </DataTemplate>\n    </GridView.ItemTemplate>\n</GridView>' },
  { name: 'TreeView', category: 'Collections', code: '<TreeView ItemsSource="{Binding FileNodes}"\n         SelectionChanged="TreeView_SelectionChanged" />' },
  { name: 'NavigationView', category: 'Navigation', code: '<NavigationView IsSettingsVisible="True"\n                 SelectionChanged="NavigationView_SelectionChanged">\n    <NavigationView.MenuItems>\n        <NavigationViewItem Content="Home" Icon="Home" />\n        <NavigationViewItem Content="Settings" Icon="Setting" />\n    </NavigationView.MenuItems>\n</NavigationView>' },
  { name: 'TabView', category: 'Navigation', code: '<TabView TabItemsSource="{Binding Documents}"\n        AddTabButtonClick="TabView_AddTabButtonClick"\n        TabCloseRequested="TabView_TabCloseRequested" />' },
  { name: 'InfoBar', category: 'Feedback', code: '<InfoBar Title="Update available"\n         Message="A new version is ready to install."\n         Severity="Informational"\n         IsOpen="True" />' },
  { name: 'TeachingTip', category: 'Feedback', code: '<TeachingTip x:Name="WelcomeTip"\n              Title="Welcome to WinUI"\n              Subtitle="Explore the controls catalog."\n              IsOpen="{Binding IsTipOpen}" />' },
  { name: 'ProgressBar', category: 'Progress', code: '<ProgressBar Value="{Binding Progress}"\n             Maximum="100"\n             IsIndeterminate="False" />' },
  { name: 'ProgressRing', category: 'Progress', code: '<ProgressRing IsActive="{Binding IsLoading}"\n             Width="32" Height="32" />' },
  { name: 'ContentDialog', category: 'Dialogs', code: '<ContentDialog x:Name="ConfirmDialog"\n                Title="Delete item?"\n                PrimaryButtonText="Delete"\n                CloseButtonText="Cancel"\n                DefaultButton="Primary" />' },
  { name: 'Flyout', category: 'Dialogs', code: '<Button Content="More actions">\n    <Button.Flyout>\n        <Flyout>\n            <MenuFlyoutItem Text="Rename" />\n        </Flyout>\n    </Button.Flyout>\n</Button>' },
  { name: 'CalendarDatePicker', category: 'Date & Time', code: '<CalendarDatePicker Header="Due date"\n                   Date="{Binding DueDate, Mode=TwoWay}" />' },
  { name: 'TimePicker', category: 'Date & Time', code: '<TimePicker Header="Reminder time"\n            Time="{Binding ReminderTime, Mode=TwoWay}" />' },
  { name: 'Image', category: 'Media', code: '<Image Source="ms-appx:///Assets/hero.png"\n       Stretch="UniformToFill"\n       AutomationProperties.Name="Hero image" />' },
  { name: 'WebView2', category: 'Media', code: '<WebView2 Source="https://learn.microsoft.com/windows/apps/winui/"\n         NavigationCompleted="WebView_NavigationCompleted" />' },
];

export const XAMLControls: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('switch-app');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const activePreset = DIALOG_PRESETS.find((p) => p.id === selectedPresetId) || DIALOG_PRESETS[0];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Support custom window event trigger
  useEffect(() => {
    const handleCustomTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.presetId) {
        setSelectedPresetId(customEvent.detail.presetId);
      }
      setIsModalOpen(true);
    };
    window.addEventListener('vone:trigger-xaml-modal', handleCustomTrigger);
    return () => window.removeEventListener('vone:trigger-xaml-modal', handleCustomTrigger);
  }, []);

  const copyCode = async (text: string, identifier: string) => {
    await navigator.clipboard?.writeText(text);
    setCopied(identifier);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const handleDialogAction = (actionName: string) => {
    setLastActionResult(`Action chosen: "${actionName}" at ${new Date().toLocaleTimeString()}`);
    setIsModalOpen(false);
  };

  const triggerModal = (presetId?: string) => {
    if (presetId) {
      setSelectedPresetId(presetId);
    }
    setIsModalOpen(true);
  };

  return (
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-4 pb-12 pt-5 font-sans text-[#e8e8e8] sm:px-7">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 border-b border-[#252525] pb-5">
          <div className="flex items-center gap-2 text-[#bdbdbd]">
            <img src={XAML_ICON_URL} alt="" aria-hidden="true" className="size-5 object-contain" />
            <span className="text-[12px] uppercase tracking-[0.18em]">WinUI 3 / XAML</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#f5f5f5]">XAML Controls</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#909090]">
            A quick reference of commonly used WinUI 3 XAML controls and their binding-ready markup.
          </p>
        </header>

        {/* ========================================================
            BLOCK: Trigger an example modal dialog
           ======================================================== */}
        <section
          aria-labelledby="trigger-modal-block-title"
          className="mb-8 overflow-hidden rounded-md border border-[#333333] bg-[#141416] p-5 shadow-2xl relative"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#4cc2ff] bg-[#4cc2ff]/10 border border-[#4cc2ff]/20">
                <Play className="size-3 fill-current" />
                Interactive Showcase
              </div>
              <h2 id="trigger-modal-block-title" className="mt-2 text-xl font-bold text-[#ffffff]">
                Trigger an example modal dialog
              </h2>
              <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#aaaaaa]">
                Interactive preview of the classic Windows 10 UWP ContentDialog dialog styled with crisp blue background (<code className="text-[#4cc2ff]">#0078d4</code>), sharp unrounded borders, white outline action buttons, and clear unblurred background overlay.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                id="btn-trigger-xaml-dialog"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerModal();
                }}
                className="inline-flex items-center gap-2 rounded-none border-2 border-white bg-[#0078d4] hover:bg-white hover:text-[#0078d4] px-6 py-2.5 text-xs font-bold text-white shadow-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <Play className="size-3.5 fill-current" />
                Trigger Modal Dialog
              </button>
            </div>
          </div>

          {/* Preset selector */}
          <div className="mt-5 pt-4 border-t border-[#252525] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#888888] uppercase tracking-wider mr-1">
              Select Preset:
            </span>
            {DIALOG_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedPresetId(preset.id);
                  }}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0078d4] text-white border border-[#4cc2ff] shadow-sm'
                      : 'bg-[#202020] text-[#aaaaaa] hover:bg-[#282828] hover:text-white border border-[#333333]'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => triggerModal()}
              className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4cc2ff] hover:underline cursor-pointer"
            >
              <ExternalLink className="size-3" />
              Open current preset dialog
            </button>
          </div>

          {/* Code snippet preview of selected dialog */}
          <div className="mt-3 relative rounded bg-[#0d0d0f] border border-[#222224] p-3 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c1c1f]">
              <span className="text-[11px] text-[#888888] font-mono">
                {activePreset.name} (ContentDialog.xaml)
              </span>
              <button
                type="button"
                onClick={() => copyCode(activePreset.xamlCode, activePreset.id)}
                className="inline-flex items-center gap-1 text-[11px] text-[#888888] hover:text-white cursor-pointer"
              >
                {copied === activePreset.id ? <Check className="size-3 text-[#6fcf97]" /> : <Clipboard className="size-3" />}
                {copied === activePreset.id ? 'Copied' : 'Copy XAML'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-5 text-[#a8d1ff] font-mono">
              <code>{activePreset.xamlCode}</code>
            </pre>
          </div>

          {lastActionResult && (
            <div className="mt-3 text-[11px] text-[#6fcf97] font-mono flex items-center gap-1.5">
              <Check className="size-3.5" />
              <span>{lastActionResult}</span>
            </div>
          )}
        </section>

        {/* Controls list */}
        <div className="flex flex-col gap-3">
          {controls.map((control) => (
            <article key={control.name} className="overflow-hidden rounded-md border border-[#292929] bg-[#101010]">
              <div className="flex items-center justify-between border-b border-[#292929] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-[14px] font-medium text-[#f0f0f0]">{control.name}</h2>
                    <p className="mt-0.5 text-[11px] text-[#777]">{control.category}</p>
                  </div>
                  {control.name === 'ContentDialog' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerModal();
                      }}
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-none border border-white/60 bg-[#0078d4] text-white hover:bg-white hover:text-[#0078d4] transition-colors cursor-pointer"
                    >
                      <Play className="size-3 fill-current" />
                      Trigger Example Modal Dialog
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => copyCode(control.code, control.name)}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] text-[#aaa] transition-colors hover:bg-[#222] hover:text-white cursor-pointer"
                  aria-label={`Copy ${control.name} XAML`}
                >
                  {copied === control.name ? <Check className="size-3.5 text-[#6fcf97]" /> : <Clipboard className="size-3.5" />}
                  {copied === control.name ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-[12px] leading-6 text-[#c9c9c9]"><code>{control.code}</code></pre>
            </article>
          ))}
        </div>
      </div>

      {/* ========================================================
          ALWAYS-ON-TOP PORTALED MODAL DIALOG
          - Mounted directly to document.body via createPortal
          - z-index: 99999999 (Always on top of everything)
          - Windows 10 UWP Style (#0078d4, sharp edges, white border buttons)
          - Clean dark backdrop (NO blur)
         ======================================================== */}
      {isMounted && isModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              id="example-content-dialog-backdrop"
              onClick={() => setIsModalOpen(false)}
              style={{
                zIndex: 99999999,
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.60)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                userSelect: 'none',
              }}
              className="fluent-modal-dialog-portal animate-in fade-in duration-150"
            >
              <div
                id="example-content-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="example-dialog-title"
                style={{
                  zIndex: 100000000,
                  position: 'relative',
                  backgroundColor: '#0078d4',
                  color: '#FFFFFF',
                  borderRadius: 0,
                  border: '1px solid rgba(255, 255, 255, 0.20)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
                  width: '100%',
                  maxWidth: '580px',
                  overflow: 'hidden',
                }}
                className="fluent-modal-dialog animate-in zoom-in-95 duration-150"
              >
                {/* Top Caption Banner (#0063b1 deeper blue) - Compact Height & Left-shifted Caption */}
                <div
                  style={{ backgroundColor: '#0063b1', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}
                  className="pl-3.5 pr-2.5 py-1.5 text-[11px] font-[350] tracking-normal text-white/95 flex items-center justify-between select-none"
                >
                  <span className="font-[350] normal-case tracking-normal text-white/95" style={{ fontWeight: 350 }}>
                    {activePreset.caption}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ borderRadius: 0 }}
                    className="hover:bg-white/20 p-1 text-white text-xs transition-colors cursor-pointer"
                    aria-label="Close dialog"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Main Content Area - Decreased Height with Semi-light Font */}
                <div style={{ backgroundColor: '#0078d4' }} className="px-6 py-3.5 space-y-1.5 font-[350]">
                  <h3
                    id="example-dialog-title"
                    style={{ fontWeight: 350 }}
                    className="text-lg sm:text-[19px] font-[350] text-white tracking-tight leading-snug"
                  >
                    {activePreset.title}
                  </h3>
                  <p
                    style={{ fontWeight: 350 }}
                    className="text-xs sm:text-[13px] text-white/95 leading-relaxed font-[350]"
                  >
                    {activePreset.message}
                  </p>
                </div>

                {/* Footer with sharp rectangular white outline buttons - 28px Height & Semi-light Font */}
                <div
                  style={{
                    backgroundColor: '#0078d4',
                    padding: '8px 24px 16px 24px',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                  }}
                  className="fluent-modal-footer flex items-center justify-end gap-2.5"
                >
                  {activePreset.primaryButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.primaryButton)}
                      style={{
                        border: '2px solid #FFFFFF',
                        borderBottom: '2px solid #FFFFFF',
                        borderRadius: 0,
                        backgroundColor: 'transparent',
                        color: '#FFFFFF',
                        minWidth: '80px',
                        height: '28px',
                        padding: '0 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        fontWeight: 350,
                        lineHeight: 1,
                      }}
                      className="text-xs font-[350] hover:bg-white hover:text-[#0078d4] transition-colors cursor-pointer"
                    >
                      {activePreset.primaryButton}
                    </button>
                  )}
                  {activePreset.secondaryButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.secondaryButton!)}
                      style={{
                        border: '2px solid #FFFFFF',
                        borderBottom: '2px solid #FFFFFF',
                        borderRadius: 0,
                        backgroundColor: 'transparent',
                        color: '#FFFFFF',
                        minWidth: '80px',
                        height: '28px',
                        padding: '0 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        fontWeight: 350,
                        lineHeight: 1,
                      }}
                      className="text-xs font-[350] hover:bg-white hover:text-[#0078d4] transition-colors cursor-pointer"
                    >
                      {activePreset.secondaryButton}
                    </button>
                  )}
                  {activePreset.closeButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.closeButton!)}
                      style={{
                        border: '2px solid #FFFFFF',
                        borderBottom: '2px solid #FFFFFF',
                        borderRadius: 0,
                        backgroundColor: 'transparent',
                        color: '#FFFFFF',
                        minWidth: '80px',
                        height: '28px',
                        padding: '0 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        fontWeight: 350,
                        lineHeight: 1,
                      }}
                      className="text-xs font-[350] hover:bg-white hover:text-[#0078d4] transition-colors cursor-pointer"
                    >
                      {activePreset.closeButton}
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
};
