import React, { useState } from 'react';
import { Check, Clipboard, Code2 } from 'lucide-react';

const controls = [
  { name: 'Button', category: 'Buttons', code: '<Button Content="Save"\n        Click="SaveButton_Click" />' },
  { name: 'TextBox', category: 'Input', code: '<TextBox Header="Name"\n         PlaceholderText="Enter your name"\n         Text="{Binding UserName, Mode=TwoWay}" />' },
  { name: 'ComboBox', category: 'Input', code: '<ComboBox Header="Theme"\n          ItemsSource="{Binding Themes}"\n          SelectedItem="{Binding SelectedTheme}" />' },
  { name: 'CheckBox', category: 'Input', code: '<CheckBox Content="Enable notifications"\n          IsChecked="{Binding NotificationsEnabled, Mode=TwoWay}" />' },
  { name: 'ToggleSwitch', category: 'Input', code: '<ToggleSwitch Header="Dark mode"\n              OnContent="On"\n              OffContent="Off"\n              IsOn="{Binding IsDarkMode}" />' },
  { name: 'ListView', category: 'Collections', code: '<ListView ItemsSource="{Binding Items}"\n         SelectedItem="{Binding SelectedItem, Mode=TwoWay}">\n    <ListView.ItemTemplate>\n        <DataTemplate>\n            <TextBlock Text="{Binding Title}" />\n        </DataTemplate>\n    </ListView.ItemTemplate>\n</ListView>' },
  { name: 'NavigationView', category: 'Navigation', code: '<NavigationView IsSettingsVisible="True"\n                 SelectionChanged="NavigationView_SelectionChanged">\n    <NavigationView.MenuItems>\n        <NavigationViewItem Content="Home" Icon="Home" />\n        <NavigationViewItem Content="Settings" Icon="Setting" />\n    </NavigationView.MenuItems>\n</NavigationView>' },
  { name: 'InfoBar', category: 'Feedback', code: '<InfoBar Title="Update available"\n         Message="A new version is ready to install."\n         Severity="Informational"\n         IsOpen="True" />' },
  { name: 'ProgressBar', category: 'Progress', code: '<ProgressBar Value="{Binding Progress}"\n             Maximum="100"\n             IsIndeterminate="False" />' },
  { name: 'ContentDialog', category: 'Dialogs', code: '<ContentDialog x:Name="ConfirmDialog"\n                Title="Delete item?"\n                PrimaryButtonText="Delete"\n                CloseButtonText="Cancel"\n                DefaultButton="Primary" />' },
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
            <Code2 className="size-4" />
            <span className="text-[12px] uppercase tracking-[0.18em]">WinUI 3 / XAML</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#f5f5f5]">XAML Controls</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#909090]">A quick reference of commonly used WinUI 3 XAML controls and their binding-ready markup.</p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
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
