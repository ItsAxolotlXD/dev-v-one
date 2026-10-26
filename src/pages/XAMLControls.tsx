import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clipboard, Play, ExternalLink } from 'lucide-react';

const XAML_ICON_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kj8VATj48xgpu6hRIVOSoJomQMTGnR.png';

interface DialogPreset {
  id: string;
  name: string;
  caption: string;
  title: string;
  message: string;
  checkboxLabel?: string;
  primaryButton: string;
  secondaryButton?: string;
  closeButton?: string;
  xamlCode: string;
}

const DIALOG_PRESETS: DialogPreset[] = [
  {
    id: 'delete-confirm',
    name: 'Delete files? (Windows 10 Photos)',
    caption: 'Photos',
    title: 'Delete these files?',
    message: 'These files will be deleted from your PC.',
    checkboxLabel: 'Also delete from OneDrive',
    primaryButton: 'Delete',
    secondaryButton: 'Cancel',
    xamlCode: `<ContentDialog x:Name="DeleteDialog"
    Title="Delete these files?"
    PrimaryButtonText="Delete"
    CloseButtonText="Cancel"
    DefaultButton="Close">
    <StackPanel>
        <TextBlock Text="These files will be deleted from your PC." />
        <CheckBox Content="Also delete from OneDrive" Margin="0,12,0,0" />
    </StackPanel>
</ContentDialog>`,
  },
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
  const [selectedPresetId, setSelectedPresetId] = useState<string>('delete-confirm');
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(false);
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
    <section className="min-h-[calc(100vh-3.5rem)] w-full bg-black px-4 pb-12 pt-6 font-sans text-[#e8e8e8] sm:px-7">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 border-b border-[#252525] pb-5">
          <div className="flex items-center gap-2 text-[#bdbdbd]">
            <img src={XAML_ICON_URL} alt="" aria-hidden="true" className="size-5 object-contain" />
            <span className="text-[12px] uppercase tracking-[0.18em]">WinUI 3 / XAML</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-[#f5f5f5]">XAML Controls</h1>
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
                Interactive preview of the classic Windows 10 UWP ContentDialog dialog (Photos / Shell) styled with pure clean surface, sharp unrounded borders, flat gray action buttons, and clear unblurred background overlay.
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
                className="inline-flex items-center gap-2 rounded-none bg-[#383838] hover:bg-[#454545] border border-neutral-600 px-6 py-2.5 text-xs font-medium text-white shadow-md transition-all active:scale-[0.98] cursor-pointer"
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
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-none bg-[#383838] text-white hover:bg-[#454545] border border-neutral-600 transition-colors cursor-pointer"
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
                  borderRadius: 0,
                  width: '100%',
                  maxWidth: '520px',
                  overflow: 'hidden',
                }}
                className="fluent-modal-dialog bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none border border-[#e3008c] shadow-[0_16px_40px_rgba(0,0,0,0.65)] animate-in zoom-in-90 duration-200"
              >
                {/* Main Content Area - Native UWP ContentDialog */}
                <div className="px-6 pt-6 pb-2 space-y-2">
                  <h2
                    id="example-dialog-title"
                    className="text-[20px] font-light text-neutral-900 dark:text-white tracking-tight leading-snug"
                  >
                    {activePreset.title}
                  </h2>
                  <p
                    className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
                  >
                    {activePreset.message}
                  </p>
                  {activePreset.checkboxLabel && (
                    <label className="flex items-center gap-2.5 pt-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checkboxChecked}
                        onChange={(e) => setCheckboxChecked(e.target.checked)}
                        className="w-[18px] h-[18px] rounded-none border border-neutral-400 dark:border-white/30 text-[#e3008c] accent-[#e3008c] cursor-pointer"
                      />
                      <span className="text-[13.5px] text-neutral-800 dark:text-neutral-200 font-normal">
                        {activePreset.checkboxLabel}
                      </span>
                    </label>
                  )}
                </div>

                {/* Footer with flat gray rectangular buttons (IMG_0568.jpeg) */}
                <div
                  className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2"
                >
                  {activePreset.primaryButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.primaryButton)}
                      className="min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
                    >
                      {activePreset.primaryButton}
                    </button>
                  )}
                  {activePreset.secondaryButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.secondaryButton!)}
                      className="min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
                    >
                      {activePreset.secondaryButton}
                    </button>
                  )}
                  {activePreset.closeButton && (
                    <button
                      type="button"
                      onClick={() => handleDialogAction(activePreset.closeButton!)}
                      className="min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
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
