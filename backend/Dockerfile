FROM mcr.microsoft.com/dotnet/sdk:8.0 as build

WORKDIR /src

COPY ["src/WeeklyPlanner.API/WeeklyPlanner.API.csproj", "src/WeeklyPlanner.API/"]
COPY ["src/WeeklyPlanner.Application/WeeklyPlanner.Application.csproj", "src/WeeklyPlanner.Application/"]
COPY ["src/WeeklyPlanner.Domain/WeeklyPlanner.Domain.csproj", "src/WeeklyPlanner.Domain/"]
COPY ["src/WeeklyPlanner.Infrastructure/WeeklyPlanner.Infrastructure.csproj", "src/WeeklyPlanner.Infrastructure/"]

RUN dotnet restore "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj"

COPY . .

RUN dotnet build "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/build

FROM build as publish

RUN dotnet publish "src/WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "WeeklyPlanner.API.dll"]
