import React, { useState } from 'react';
import { Check, Clipboard } from 'lucide-react';

const XAML_ICON_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kj8VATj48xgpu6hRIVOSoJomQMTGnR.png';

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

  const copyCode = async (control: (typeof controls)[number]) => {
    await navigator.clipboard?.writeText(control.code);
    setCopied(control.name);
    window.setTimeout(() => setCopied(null), 1400);
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
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#909090]">A quick reference of commonly used WinUI 3 XAML controls and their binding-ready markup.</p>
        </header>

        <div className="flex flex-col gap-3">
          {controls.map((control) => (
            <article key={control.name} className="overflow-hidden rounded-md border border-[#292929] bg-[#101010]">
              <div className="flex items-center justify-between border-b border-[#292929] px-4 py-3">
                <div>
                  <h2 className="text-[14px] font-medium text-[#f0f0f0]">{control.name}</h2>
                  <p className="mt-0.5 text-[11px] text-[#777]">{control.category}</p>
                </div>
                <button type="button" onClick={() => copyCode(control)} className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] text-[#aaa] transition-colors hover:bg-[#222] hover:text-white" aria-label={`Copy ${control.name} XAML`}>
                  {copied === control.name ? <Check className="size-3.5 text-[#6fcf97]" /> : <Clipboard className="size-3.5" />}
                  {copied === control.name ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-[12px] leading-6 text-[#c9c9c9]"><code>{control.code}</code></pre>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
